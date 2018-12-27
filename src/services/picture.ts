import { Service } from 'typedi';
import { getCustomRepository } from 'typeorm';

import { PictureInput } from '@graphql/Picture/input';
import { PictureRepository } from '@repositories/PictureRepository';

@Service()
export class PictureService {
  public pictureRepository: PictureRepository = getCustomRepository(PictureRepository);

  public add = this.pictureRepository.add;

  public getList = async () => {
    return await this.pictureRepository.createQueryBuilder('picture')
    .leftJoinAndSelect('picture.user', 'user')
    .getMany();
  }

  public getOne = async (id: string) => {
    const data = await this.pictureRepository.createQueryBuilder('picture')
      .where('picture.id=:id', { id })
      .leftJoinAndSelect('picture.user', 'user')
      .getOne();
    console.log(data);
    return data;
  }
}
