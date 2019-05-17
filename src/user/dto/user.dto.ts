import { IsEmail, IsString, Length } from 'class-validator';

import { IsUserName, IsWebsite } from '@server/common/validator';
import { Exclude, Expose } from 'class-transformer';

/**
 * 注册管道
 *
 * @export
 * @class CreateUserDto
 */
@Exclude()
export class CreateUserDto {

  /**
   * 邮箱
   *
   * @type {string}
   * @memberof CreateUserDto
   */
  @IsEmail()
  @Expose()
  public readonly email!: string;
  /**
   * 用户名
   *
   * @type {string}
   * @memberof CreateUserDto
   */
  @Length(1, 15)
  @IsString()
  @IsUserName()
  @Expose()
  public readonly username!: string;

  /**
   * 密码
   *
   * @type {string}
   * @memberof CreateUserDto
   */
  @Length(8, 30)
  @IsString()
  @Expose()
  public readonly password!: string;
}

/**
 * 修改用户信息管道
 *
 * @export
 * @class UpdateProfileSettingDto
 */
@Exclude()
export class UpdateProfileSettingDto {
  /** 昵称 */
  @IsString()
  @Expose()
  public readonly name!: string;

  /** 个人简介 */
  @IsString()
  @Expose()
  public readonly bio!: string;

  /** 个人网站 */
  @IsWebsite()
  @Expose()
  public readonly website!: string;
}
