import { action, observable } from 'mobx';
import { merge, pick } from 'lodash';

import { CommentEntity } from '@lib/common/interfaces/comment';
import { PictureEntity } from '@lib/common/interfaces/picture';
import { addComment, getPictureComment } from '@lib/services/comment';
import {
  getPicture, likePicture, unlikePicture, deletePicture,
} from '@lib/services/picture';

import { HttpStatus } from '@lib/common/enums/http';
import { BaseStore } from '../base/BaseStore';

export class PictureScreenStore extends BaseStore {
  @observable public info!: PictureEntity;

  @observable public comment: CommentEntity[] = [];

  @observable public id!: number;

  public cacheData: Record<string, PictureEntity> = {};

  @action public setInfo = (data: PictureEntity) => {
    this.id = data.id;
    this.info = data;
  }

  @action public setComment = (data: CommentEntity[]) => {
    this.comment = data;
  }

  public getPictureInfo = async (id: string, header?: any) => {
    const { data } = await getPicture(id, header);
    if (!data) {
      // eslint-disable-next-line no-throw-literal
      throw {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'no collection',
      };
    }
    this.setInfo(data);
    this.setCache(this.id, this.info);
  }

  @action public getComment = async () => {
    const { data } = await getPictureComment(this.id);
    this.setComment(data.data);
  }

  public addComment = async (content: string) => {
    const { data } = await addComment(content, this.id);
    this.pushComment(data);
  }

  public deletePicture = async () => {
    await deletePicture(this.id);
    delete this.cacheData[this.id];
  }

  @action public pushComment = (comment: CommentEntity) => {
    this.comment.unshift(comment);
  }

  @action
  public like = async () => {
    try {
      let func = unlikePicture;
      if (!this.info.isLike) {
        func = likePicture;
      }
      const { data } = await func(this.info.id);
      this.info.isLike = data.isLike;
      this.info.likes = data.count;
    // tslint:disable-next-line: no-empty
    } catch (err) {
      console.error(err);
    }
  }

  public setCache = (id: ID, data: PictureEntity) => {
    this.cacheData[id] = data;
  }

  public getCache = (type = '') => {
    if (this.cacheData[type]) {
      this.setInfo(this.cacheData[type]);
    }
  }

  public isCache = (type = '') => this.cacheData[type] !== undefined;

  public updateInfo = (picture: PictureEntity) => {
    const data = merge(this.info, pick(picture, ['title', 'bio', 'tags', 'isPrivate']));
    this.setInfo(data);
  }
}
