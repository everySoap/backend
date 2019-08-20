import { observable, action } from 'mobx';

import { CollectionEntity, GetCollectionPictureListDto } from '@lib/common/interfaces/collection';
import { getCollectionInfo, getCollectionPictureList } from '@lib/services/collection';
import { IPictureListRequest, PictureEntity } from '@lib/common/interfaces/picture';
import { server } from '@lib/common/utils';
import { BaseStore } from '../base/BaseStore';

export class CollectionScreenStore extends BaseStore {
  public _infoCache: Record<string, CollectionEntity> = {}

  public _pictureListCache: Record<string, IPictureListRequest> = {}

  @observable public info?: CollectionEntity;

  @observable public list: PictureEntity[] = [];

  @observable public count = 0;

  @observable public listQuery!: GetCollectionPictureListDto;

  @action
  public initQuery = () => {
    this.listQuery = {
      page: 1,
      pageSize: Number(process.env.LIST_PAGE_SIZE),
      timestamp: Number(Date.parse(new Date().toISOString())),
    };
  }

  public getInfo = async (id: string, headers?: any) => {
    const { data } = await getCollectionInfo(id, headers);
    this.setInfo(data);
    return '';
  }

  public getList = async (id: string, headers?: any) => {
    this.initQuery();
    const { data } = await getCollectionPictureList(id, this.listQuery, headers);
    this.setList(id, data);
  }

  @action
  public setList = (id: string, data: IPictureListRequest, plus = false) => {
    if (plus) {
      this.list = this.list.concat(data.data);
    } else {
      this.list = data.data;
    }
    this.count = data.count;
    this.listQuery.page = data.page;
    this.listQuery.pageSize = data.pageSize;
    this.listQuery.timestamp = data.timestamp;
    this.setPictureCache(id, {
      ...data,
      data: this.list,
    });
  }

  @action
  public setInfo = (data: CollectionEntity) => {
    this.info = data;
    this.setInfoCache(data.id, data);
  }

  public setPictureCache = (id: string, data: IPictureListRequest) => {
    this._pictureListCache[id] = data;
  }

  public getPictureCache = (id: string) => {
    const data = this._pictureListCache[id];
    if (!data) return false;
    this.setList(id, data);
    return true;
  }

  public setInfoCache = (id: string, data: CollectionEntity) => {
    if (!server) this._infoCache[id] = data;
  }

  public getInfoCache = (id: string) => {
    const data = this._infoCache[id];
    if (!data) return false;
    this.setInfo(data);
    return true;
  }
}