import React, { useEffect } from 'react';

import { PictureEntity } from '@pages/common/interfaces/picture';
import { getScrollHeight, getScrollTop, getWindowHeight, isSafari, server } from '@pages/common/utils';
import { listParse } from '@pages/common/utils/waterfall';
import { Loading } from '@pages/components/Loading';
import { NoSSR } from '@pages/components/SSR';
import { debounce } from 'lodash';
import { observable, reaction } from 'mobx';
import { observer } from 'mobx-react';
import Col from './Col';
import { Footer, PictureContent, Wapper } from './styles';

import useMedia from '@pages/common/utils/useMedia';
import { connect } from 'formik';
import { defaultBreakpoints } from 'styled-media-query';

interface IProps {
  /**
   * picture列表数据
   *
   * @type {PictureEntity[]}
   * @memberof IProps
   */
  data: PictureEntity[];

  like: (data: PictureEntity) => void;

  onPage?: () => Promise<void>;

  noMore: boolean;
}

const mediaArr = [
  {
    media: `(min-width: ${defaultBreakpoints.large})`,
    col: 4,
  },
  {
    media: `(max-width: ${defaultBreakpoints.large}) and (min-width: ${defaultBreakpoints.medium})`,
    col: 3,
  },
  {
    media: `(max-width: ${defaultBreakpoints.medium}) and (min-width: ${defaultBreakpoints.small})`,
    col: 2,
  },
  {
    media: `(max-width: ${defaultBreakpoints.small})`,
    col: 1,
  },
];

const colArr = mediaArr.map(media => media.col);

const OFFSET = 700;

export const PictureList: React.FC<IProps> = ({
  data,
  like,
  onPage,
  noMore = false,
}) => {
  let serverList: PictureEntity[][][] = [];
  const [clientList, setClientList] = React.useState<PictureEntity[][]>([]);
  const col = useMedia(
    mediaArr.map(media => media.media),
    mediaArr.map(media => media.col),
    4,
  );
  useEffect(() => {
    scrollEvent();
  }, []);
  const pageLock = React.useRef<boolean>(false);
  // 滚动事件绑定
  useEffect(() => {
    if (!noMore) {
      window.addEventListener('scroll', scrollEvent);
      return () => window.removeEventListener('scroll', scrollEvent);
    }
    return;
  }, []);
  // 处理客户端列表数据
  useEffect(() => {
    pictureList();
  }, [col, data]);
  // 服务端渲染列表
  if (server) {
    serverList = colArr.map(_col => listParse(data, _col));
  }

  const pictureList = () => {
    setClientList(_ => listParse(data, col));
  };

  const scrollEvent = debounce(async () => {
    const offset = getScrollHeight() - (getScrollTop() + getWindowHeight());
    if (offset <= OFFSET && !pageLock.current && !noMore) {
      if (onPage) {
        pageLock.current = true;
        await onPage();
        setTimeout(() => {
          pageLock.current = false;
        }, 200);
      }
    }
  }, 50);
  return (
    <Wapper>
      <NoSSR key="server" server={false}>
        <PictureContent>
          {
            serverList.map((mainCol, i) => (
              <Col ssr={true} col={colArr[i]} key={colArr[i]} list={mainCol} />
            ))
          }
        </PictureContent>
      </NoSSR>
      <NoSSR key="client">
        <Col style={{ display: 'grid' }} like={like} col={col} list={clientList} />
      </NoSSR>
      <span>
        <Footer key="footer">
          {
            noMore ? (
              <span>没有更多内容啦</span>
            ) : (
              <Loading size={8} />
            )
          }
        </Footer>
      </span>
    </Wapper>
  );
};
