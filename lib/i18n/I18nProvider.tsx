import React from 'react';
import _ from 'lodash';
import format from 'string-format';

import { LocaleType } from '@common/enum/locale';
import { I18nContext, II18nContext } from './I18nContext';
import { I18nNamespace } from './Namespace';

export interface II18nValue {
  locale: LocaleType;
  value: RecordPartial<I18nNamespace, any>;
  namespacesRequired: I18nNamespace[];
  currentNamespace: I18nNamespace[];
}

interface IProps {
  value: II18nValue;
}

const i18n = (data: II18nValue): II18nContext => ({
  t: (value, ...arg) => {
    let title = value;
    // eslint-disable-next-line no-restricted-syntax
    for (const type of data.namespacesRequired) {
      if (type) {
        const v = _.get(data.value, `${type}.${value}`);
        if (v) {
          title = format(v, ...arg);
          break;
        }
      }
    }
    return title;
  },
  ...data,
});

export const I18nProvider: React.FC<IProps> = ({
  children,
  value,
}) => <I18nContext.Provider value={i18n(value)}>{children}</I18nContext.Provider>;
