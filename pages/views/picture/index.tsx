import moment from 'moment';
import Head from 'next/Head';
import React from 'react';

import { CustomNextContext, CustomNextPage, IBaseScreenProps } from '@pages/common/interfaces/global';
import { PictureEntity } from '@pages/common/interfaces/picture';
import { getTitle } from '@pages/common/utils';
import { connect } from '@pages/common/utils/store';
import { Avatar, GpsImage } from '@pages/components';
import { Comment } from '@pages/components/Comment';
import { EXIFModal } from '@pages/components/EXIFModal';
import { LikeButton } from '@pages/components/LikeButton';
import { Popover } from '@pages/components/Popover';
import { Tag } from '@pages/components/Tag';
import { withError } from '@pages/components/withError';
import { PictureImage } from '@pages/containers/Picture/Image';
import { Calendar } from '@pages/icon';
import { Link } from '@pages/routes';
import { AccountStore } from '@pages/stores/AccountStore';
import { IMyMobxStore } from '@pages/stores/init';
import { PictureScreenStore } from '@pages/stores/screen/Picture';
import { ThemeStore } from '@pages/stores/ThemeStore';
import { Cell } from 'styled-css-grid';
import {
  BaseInfoHandleBox,
  BaseInfoItem,
  Bio,
  Content,
  GpsCotent,
  InfoButton,
  PictureBaseInfo,
  PictureBox,
  TagBox,
  Title,
  UserHeader,
  UserInfo,
  UserLink,
  UserName,
  Wrapper,
} from './styles';

interface InitialProps extends IBaseScreenProps {
  screenData: PictureEntity;
}

interface IProps extends InitialProps {
  accountStore: AccountStore;
  themeStore: ThemeStore;
  pictureStore: PictureScreenStore;
}

const Picture: CustomNextPage<IProps, any> = ({
  accountStore,
  themeStore,
  pictureStore,
}) => {
  const [EXIFVisible, setEXIFVisible] = React.useState(false);
  const { isLogin } = accountStore;
  const { themeData } = themeStore;
  const { info, like, getComment, comment } = pictureStore;
  const { user, tags } = info;

  React.useEffect(() => {
    getComment();
  }, []);

  const closeEXIF = () => {
    setEXIFVisible(false);
  };
  const openEXIF = () => {
    setEXIFVisible(true);
  };

  const isLocation = info.exif && info.exif.location && info.exif.location.length > 0;
  return (
    <Wrapper>
      <Head>
        <title>{getTitle(`${info.title} (@${user.username})`)}</title>
        <script
          type="text/javascript"
          src="https://webapi.amap.com/maps?v=1.4.14&key=e55a0b1eb15adb1ff24cec5a7aacd637"
        />
      </Head>
      <UserHeader columns={2}>
        <UserInfo width={1}>
          <Link route={`/@${user.username}`}>
            <UserLink href={`/@${user.username}`}>
              <Avatar style={{ marginRight: '15px' }} src={user.avatar}/>
              <UserName>{user.name}</UserName>
            </UserLink>
          </Link>
        </UserInfo>
        <Cell width={1}/>
      </UserHeader>
      <PictureBox>
        <PictureImage size="full" detail={info} lazyload={false} />
      </PictureBox>
      <Content>
        <Title>{info.title}</Title>
        <PictureBaseInfo>
          <div>
            <Popover
              openDelay={100}
              trigger="hover"
              placement="top"
              theme="dark"
              content={<span>{moment(info.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>}
            >
              <BaseInfoItem>
                <Calendar size={20} />
                <p>{moment(info.createTime).from()}</p>
              </BaseInfoItem>
            </Popover>
          </div>
          <BaseInfoHandleBox>
            <Popover
              trigger="hover"
              placement="top"
              theme="dark"
              openDelay={100}
              content={<span>图片信息</span>}
            >
              <div
                style={{ fontSize: 0 }}
                onClick={openEXIF}
              >
                <InfoButton style={{ cursor: 'pointer' }}/>
              </div>
            </Popover>
            {
              isLogin &&
              <LikeButton
                color={themeData.colors.secondary}
                isLike={info.isLike}
                size={22}
                onLike={like}
                // onLike={this.like}
              />
            }
          </BaseInfoHandleBox>
        </PictureBaseInfo>
        {
          tags.length > 0 &&
          <TagBox>
            {
              tags.map(tag => (
                <Link route={`/tag/${tag.name}`} key={tag.id}>
                  <a style={{ textDecoration: 'none' }} href={`/tag/${tag.name}`}>
                    <Tag>
                      {tag.name}
                    </Tag>
                  </a>
                </Link>
              ))
            }
          </TagBox>
        }
        {
          info.bio && (
            <Bio>
              {info.bio}
            </Bio>
          )
        }
        {
          isLocation && (
            <GpsCotent>
              <GpsImage gps={info!.exif!.location!} />
            </GpsCotent>
          )
        }
      </Content>
      <Comment comment={comment} />
      <EXIFModal
        visible={EXIFVisible}
        onClose={closeEXIF}
        picture={info}
      />
    </Wrapper>
  );
};

/// TODO: mobx-react@6 @inject 不执行 getInitialProps 的暂时解决方案
Picture.getInitialProps = async ({ mobxStore, route, req }: CustomNextContext) => {
  const { params } = route;
  return mobxStore.screen.pictureStore.getPictureInfo(
    params.id!,
    req ? req.headers : undefined,
  );
};

export default withError<IProps>(
  connect((stores: IMyMobxStore) => ({
    pictureStore: stores.screen.pictureStore,
    accountStore: stores.accountStore,
    themeStore: stores.themeStore,
  }))(Picture),
);
