import { box } from '@pages/common/utils/themes/common';
import { rem } from 'polished';
import styled from 'styled-components';

export const Warpper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1000;
  overflow-y: auto;
  background-color: rgba(0, 0, 0, .4);
`;

export const Box = styled.div`
  ${props => box(props.theme, '100%', true)}
  max-width: ${rem('560px')};
  padding: 0;
  border: none;
  margin: 0 auto;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export const Title = styled.h2`
  font-size: ${_ => _.theme.fontSizes[3]};
  padding: ${rem('24px')};
`;
