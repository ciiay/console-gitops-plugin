import './GitOpsDeploymentHistory.scss';

import * as _ from 'lodash';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import {
  ListPageFilter,
  RowFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { LoadingBox } from '@patternfly/quickstarts';

import GitOpsEmptyState from '../GitOpsEmptyState';
import { GitOpsHistoryData } from '../utils/gitops-types';
import { getEnvData } from '../utils/gitops-utils';
import { GitOpsDeploymentHistoryColumns } from './GitOpsDeploymentHistoryColumns';
import { GitOpsDeploymentHistoryTableRow } from './GitOpsDeploymentHistoryTableRow';

type GitOpsDeploymentHistoryProps = {
  customData: {
    emptyStateMsg: string;
    envs: string[];
    applicationBaseURI: string;
  };
};
const GitOpsDeploymentHistory: React.FC<GitOpsDeploymentHistoryProps> = ({
  customData: { emptyStateMsg, envs, applicationBaseURI },
}) => {
  const { t } = useTranslation();
  const columns = GitOpsDeploymentHistoryColumns();
  const envRowFilters: RowFilter[] = [
    {
      filterGroupName: t('gitops-plugin~Environment'),
      type: 'environment',
      reducer: (s: GitOpsHistoryData): string => s?.environment,
      filter: (input, history) =>
        history.environment.includes(input.selected) ||
        input.selected.includes(history.environment),
      items: _.map(envs, (env) => ({ id: env, title: env })),
    },
  ];

  const historyBaseURI = `/api/gitops/history/environment`;
  const [historyData, setHistoryData] = React.useState<GitOpsHistoryData[]>(null);
  const [error, setError] = React.useState<string>(null);
  React.useEffect(() => {
    let ignore = false;
    const getHistory = async () => {
      if (!_.isEmpty(envs) && applicationBaseURI) {
        let arrayHistory;
        try {
          arrayHistory = await Promise.all(
            _.map(envs, (env) =>
              getEnvData(historyBaseURI, historyBaseURI, env, applicationBaseURI),
            ),
          );
          arrayHistory = arrayHistory?.flat(1);
        } catch (err) {
          if (err instanceof Error) {
            if (err.name === 'HttpError' && err.message === 'Not Found') {
              setError(
                t(
                  'gitops-plugin~The history cannot be obtained due to an HTTP Not Found Error. This could mean that the GitOps Operator needs to be upgraded to the latest version or the GitOps cluster pod is not running.',
                ),
              );
            } else {
              setError(
                t(
                  'gitops-plugin~The history cannot be obtained due to an error. Check the GitOps cluster pod log for any errors.',
                ),
              );
            }
          }
        }
        if (ignore) return;
        setHistoryData(arrayHistory);
      }
    };
    getHistory();
    return () => {
      ignore = true;
    };
  }, [applicationBaseURI, envs, historyBaseURI, historyData, t]);

  const [data, filteredData, onFilterChange] = useListPageFilter(historyData, envRowFilters);

  return (
    <div className="odc-gitops-history-list">
      {!historyData && !error ? (
        <LoadingBox />
      ) : error ? (
        <GitOpsEmptyState emptyStateMsg={error} />
      ) : emptyStateMsg ? (
        <GitOpsEmptyState emptyStateMsg={emptyStateMsg || t('gitops-plugin~No history')} />
      ) : (
        <>
          <ListPageFilter
            data={data}
            loaded={!emptyStateMsg}
            rowFilters={envRowFilters}
            onFilterChange={onFilterChange}
            hideNameLabelFilters
          />
          <VirtualizedTable
            data={filteredData}
            unfilteredData={historyData}
            loaded={!emptyStateMsg}
            columns={columns}
            Row={GitOpsDeploymentHistoryTableRow}
            loadError={null}
          />
        </>
      )}
    </div>
  );
};

export default GitOpsDeploymentHistory;
