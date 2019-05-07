import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, getManager, Repository } from 'typeorm';

import { NotificationService } from '@server/notification/notification.service';
import { UserEntity } from '@server/user/user.entity';
import { PictureEntity } from '../picture.entity';
import { PictureUserActivityEntity } from './user-activity.entity';

@Injectable()
export class PictureUserActivityService {
  constructor(
    private readonly notificationService: NotificationService,
    @InjectRepository(PictureUserActivityEntity)
    private activityRepository: Repository<PictureUserActivityEntity>,
  ) {}

  public getOne = async (pictureId: string | number, userId: string | number) => {
    return this.activityRepository.createQueryBuilder('activity')
      .where('activity.pictureId=:pictureId', { pictureId })
      .leftJoinAndSelect('activity.user', 'user')
      .leftJoinAndSelect('activity.picture', 'picture')
      .andWhere('activity.userId=:userId', { userId })
      .getOne();
  }

  public like = async (
    picture: PictureEntity,
    user: UserEntity,
  ) => {
    const activity = await this.getOne(picture.id, user.id);
    await getManager().transaction(async (entityManager) => {
      if (activity) {
        await entityManager.save(
          this.activityRepository.merge(activity, {
            like: !activity.like,
            ...!activity.like ? {
              likedTime: new Date(),
            } : {},
          }),
        );
      } else {
        await entityManager.save(
          this.activityRepository.create({
            picture,
            user,
            like: true,
            likedTime: new Date(),
          }),
        );
      }
    });
    if (!activity || activity.like) {
      this.notificationService.publishNotification(user, picture.user);
    }
    return this.activityRepository.count({ picture, like: true });
  }

  public setInfo = async (
    data: Partial<PictureUserActivityEntity>,
    picture: PictureEntity,
    user: UserEntity,
  ) => {
    const activity = await this.getOne(picture.id, user.id);
    if (activity) {
      return this.activityRepository.save(
        this.activityRepository.merge(activity, data),
      );
    }
    return this.activityRepository.save(
      this.activityRepository.create(data),
    );
  }
  public deleteByPicture = async (picture: PictureEntity, entityManager: EntityManager) => {
    return entityManager
      .createQueryBuilder()
      .delete()
      .from(PictureUserActivityEntity)
      .where('pictureId=:id', { id: picture.id })
      .execute();
  }
}
