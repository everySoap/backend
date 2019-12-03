import {
  BadGatewayException, Injectable, forwardRef, Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { listRequest } from '@server/common/utils/request';
import { PictureService } from '@server/modules/picture/picture.service';
import { UserEntity } from '@server/modules/user/user.entity';
import { UserService } from '@server/modules/user/user.service';
import { NotificationType, NotificationCategory } from '@common/enum/notification';
import { classToPlain } from 'class-transformer';
import { CommentEntity } from './comment.entity';
import { CreatePictureCommentDot, GetPictureCommentListDto } from './dto/comment.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @Inject(forwardRef(() => PictureService))
    private readonly pictureService: PictureService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  public async getPictureList(id: string, query: GetPictureCommentListDto, _user: Maybe<UserEntity>) {
    const q = this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.pictureId=:id AND comment.parentCommentId IS NULL', { id })
      .orderBy('comment.createTime', 'ASC')
      .leftJoinAndSelect('comment.user', 'user');
    // this.userService.selectInfo(q);
    const [data, count] = await q.getManyAndCount();
    return listRequest(query, classToPlain(data), count);
  }

  public async getRawOne(id: ID) {
    return this.commentRepository.createQueryBuilder('comment')
      .where('comment.id=:id', { id })
      .leftJoinAndSelect('comment.parentComment', 'parentComment')
      .leftJoinAndSelect('comment.replyComment', 'replyComment')
      .leftJoinAndSelect('comment.replyUser', 'replyUser')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.picture', 'picture')
      .getOne();
  }

  public async getOne(id: ID) {
    return this.commentRepository.createQueryBuilder('comment')
      .where('comment.id=:id', { id })
      .leftJoinAndSelect('comment.parentComment', 'parentComment')
      .leftJoinAndSelect('comment.user', 'user')
      .getOne();
  }

  public async create(user: UserEntity, data: CreatePictureCommentDot, id: ID, commentId?: ID) {
    const picture = await this.pictureService.getOne(id);
    if (!picture || (picture && picture.isPrivate && picture.user.id !== user.id)) {
      throw new BadGatewayException('no_picture');
    }
    const createData: MutablePartial<CommentEntity> = {
      ...data,
      picture,
      user,
    };
    if (commentId !== undefined) {
      const comment = await this.getOne(commentId);
      if (comment) {
        if (comment.parentComment) {
          createData.parentComment = comment.parentComment;
        } else {
          createData.parentComment = comment;
        }
        createData.replyUser = comment.user;
        createData.replyComment = comment;
      } else {
        throw new BadGatewayException('no_comment');
      }
    } else {
      createData.replyUser = picture.user;
    }
    const isOwner = createData.replyUser.id === user.id;
    const comment = await this.commentRepository.save(
      this.commentRepository.create(createData),
    );
    if (!isOwner) {
      this.notificationService.publishNotification(
        user,
        createData.replyUser,
        {
          type: NotificationType.USER,
          category: commentId ? NotificationCategory.REPLY : NotificationCategory.COMMENT,
          mediaId: comment.id.toString(),
        },
      );
    }
    return classToPlain(comment);
  }

  public async childComments(id: ID, user: Maybe<UserEntity>, limit?: number, query?: GetPictureCommentListDto) {
    const q = this.commentRepository.createQueryBuilder('comment')
      .where('comment.parentComment=:id', { id })
      .leftJoinAndSelect('comment.parentComment', 'parentComment')
      .leftJoinAndSelect('comment.replyComment', 'replyComment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.replyUser', 'replyUser')
      .orderBy('comment.createTime', 'ASC');
    if (limit) {
      q.limit(limit);
    }
    if (query) {
      if (query.timestamp) {
        q.where('comment.createTime <= :time', { time: query.time });
      }
      q.skip((query.page - 1) * query.pageSize).take(query.pageSize);
      const [data, count] = await q.getManyAndCount();
      return listRequest(query, classToPlain(data), count);
    }
    return classToPlain(await q.getMany());
  }

  public async getSubCount(id: ID) {
    const data = await this.commentRepository.createQueryBuilder('comment')
      .where('comment.parentComment=:id', { id })
      .getCount();
    return classToPlain(data);
  }
}
