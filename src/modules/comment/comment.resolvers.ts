import {
  Args, Context, Mutation, Query, Resolver,
} from '@nestjs/graphql';

import { UseGuards } from '@nestjs/common';
import { Roles } from '@server/common/decorator/roles.decorator';
import { AuthGuard } from '@server/common/guard/auth.guard';
import { Role } from '@server/modules/user/enum/role.enum';
import { UserEntity } from '@server/modules/user/user.entity';
import { CommentService } from './comment.service';
import { CreatePictureCommentDot, GetPictureCommentListDto } from './dto/comment.dto';

@Resolver('Comment')
@UseGuards(AuthGuard)
export class CommentResolver {
  constructor(
    private readonly commentService: CommentService,
  ) {}

  @Query()
  public async comments(
    @Context('user') user: Maybe<UserEntity>,
    @Args('id') id: string,
    @Args() query: GetPictureCommentListDto,
  ) {
    return this.commentService.getPictureList(id, query, user);
  }

  @Mutation()
  @Roles(Role.USER)
  public async addComment(
    @Context('user') user: UserEntity,
    @Args('id') id: string,
    @Args('data') data: CreatePictureCommentDot,
  ) {
    return this.commentService.create(data, id, user);
  }
}
