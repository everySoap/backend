import { observable, reaction } from 'mobx';
import { observer } from 'mobx-react';
import React, { CSSProperties } from 'react';
import ReactDOM from 'react-dom';
import { Transition } from 'react-transition-group';
import { TransitionStatus } from 'react-transition-group/Transition';

import { getScrollWidth, server, setBodyCss } from '@lib/common/utils';
import { isFunction } from 'lodash';
import { NoSSR } from '../SSR';
import {
  Box, Content, Mask, Wrapper,
} from './styles';

let _modalIndex = 0;

interface IModalProps {
  visible: boolean;
  onClose?: () => void;
  boxStyle?: React.CSSProperties;
}

const transitionStyles: {
  [key in TransitionStatus]?: CSSProperties
} = {
  entering: { opacity: 0, transform: 'scale(.98)' },
  entered: { opacity: 1, transform: 'scale(1)' },
  exiting: { opacity: 0, transform: 'scale(.98)' },
  exited: { opacity: 1, transform: 'scale(1)' },
};

const maskTransitionStyles: {
  [key in TransitionStatus]?: CSSProperties
} = {
  entering: { opacity: 0 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 1 },
};

@observer
export class Modal extends React.PureComponent<IModalProps> {
  public contentRef = React.createRef<HTMLDivElement>();

  public wrapperRef = React.createRef<HTMLDivElement>();

  @observable public isDestroy = !this.props.visible;

  public initStyle?: () => void;

  constructor(props: IModalProps) {
    super(props);
    // eslint-disable-next-line react/destructuring-assignment
    reaction(() => this.props.visible, (vis) => {
      if (vis) {
        if (_modalIndex === 0) {
          this.initStyle = setBodyCss({
            overflowY: 'hidden',
            paddingRight: `${this.scrollWidth}px`,
          });
        }
        // eslint-disable-next-line no-plusplus
        _modalIndex++;
        this.isDestroy = false;
      }
    });
  }

  public componentDidMount() {
    const { visible } = this.props;
    if (visible) {
      this.initStyle = setBodyCss({
        overflowY: 'hidden',
        paddingRight: `${this.scrollWidth}px`,
      });
    }
  }

  public componentWillUnmount() {
    this.onDestroy(true);
  }

  get scrollWidth() {
    return getScrollWidth();
  }


  public handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (e.target === this.contentRef.current || e.target === this.wrapperRef.current) {
      if (isFunction(this.props.onClose)) {
        this.props.onClose();
      }
    }
  }

  public onDestroy = (isDestroy = false) => {
    if (isFunction(this.initStyle)) {
      this.initStyle();
    }
    if (!isDestroy) {
      // eslint-disable-next-line no-plusplus
      _modalIndex--;
    }
    this.isDestroy = true;
  }

  public render() {
    const { visible, boxStyle, children } = this.props;
    if (this.isDestroy) {
      return null;
    }
    return (
      <NoSSR>
        {
          !server && ReactDOM.createPortal(
            (
              <Transition
                in={visible}
                onExited={() => this.onDestroy()}
                appear
                timeout={{
                  enter: 0,
                  exit: 200,
                }}
              >
                {
                  state => (
                    <div>
                      <Mask
                        style={{ ...maskTransitionStyles[state], transition: '.2s all ease' }}
                      />
                      <Wrapper onClick={this.handleClick} ref={this.wrapperRef}>
                        <Content ref={this.contentRef}>
                          <Box
                            style={{
                              ...transitionStyles[state],
                              ...boxStyle || {},
                            }}
                          >
                            {children}
                          </Box>
                        </Content>
                      </Wrapper>
                    </div>
                  )
                }
              </Transition>
            ),
            document.querySelector('body')!,
          )
        }
      </NoSSR>
    );
  }
}
