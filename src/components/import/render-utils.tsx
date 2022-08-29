import * as React from 'react';
import { BitbucketIcon, GitAltIcon, GithubIcon, GitlabIcon } from '@patternfly/react-icons';
import { TFunction } from 'i18next';
import CheIcon from './CheIcon';
import { detectGitType } from '../helpers/stringHelpers';
import { GitProvider } from '../../types/git';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import { Link } from 'react-router-dom';

export const routeDecoratorIcon = (
  routeURL: string,
  radius: number,
  t: TFunction,
  cheEnabled?: boolean,
  cheIconURL?: string,
): React.ReactElement => {
  if (cheEnabled && routeURL) {
    return cheIconURL ? (
      <image xlinkHref={cheIconURL} width={radius} height={radius} />
    ) : (
      <CheIcon style={{ fontSize: radius }} />
    );
  }
  switch (detectGitType(routeURL)) {
    case GitProvider.INVALID:
      // Not a valid url and thus not safe to use
      return null;
    case GitProvider.GITHUB:
      return <GithubIcon style={{ fontSize: radius }} title={t('devconsole~Edit source code')} />;
    case GitProvider.BITBUCKET:
      return (
        <BitbucketIcon style={{ fontSize: radius }} title={t('devconsole~Edit source code')} />
      );
    case GitProvider.GITLAB:
      return <GitlabIcon style={{ fontSize: radius }} title={t('devconsole~Edit source code')} />;
    default:
      return <GitAltIcon style={{ fontSize: radius }} title={t('devconsole~Edit source code')} />;
  }
};

type BreadCrumbsProps = {
  breadcrumbs: { name: string; path: string }[];
};

export const BreadCrumbs: React.SFC<BreadCrumbsProps> = ({ breadcrumbs }) => (
  <Breadcrumb className="co-breadcrumb">
    {breadcrumbs.map((crumb, i, { length }) => {
      const isLast = i === length - 1;

      return (
        <BreadcrumbItem key={i} isActive={isLast}>
          {isLast ? (
            crumb.name
          ) : (
            <Link
              className="pf-c-breadcrumb__link"
              to={crumb.path}
              data-test-id={`breadcrumb-link-${i}`}
            >
              {crumb.name}
            </Link>
          )}
        </BreadcrumbItem>
      );
    })}
  </Breadcrumb>
);
