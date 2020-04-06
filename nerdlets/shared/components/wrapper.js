import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { BASE_NERDGRAPH_QUERY } from '../utils/queries';
import { NerdletStateContext, NerdGraphQuery, Spinner } from 'nr1';
import { NerdGraphError, EmptyState } from '@newrelic/nr1-community';
import NrqlFactory from '../nrql-factory';
import MeasureToggle from './measure-toggle';
import Breakdown from './breakdown';

export default class Wrapper extends React.PureComponent {
  static propTypes = {
    setBrowserAppMeasures: PropTypes.func,
    browserAppMeasures: PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  render() {
    const { setBrowserAppMeasures, browserAppMeasures } = this.props;
    return (
      <NerdletStateContext.Consumer>
        {nerdletUrlState => {
          return (
            <NerdGraphQuery
              query={BASE_NERDGRAPH_QUERY}
              variables={{ entityGuid: nerdletUrlState.entityGuid }}
              fetchPolicyType={NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE}
            >
              {({ data, loading, error }) => {
                if (loading) {
                  return <Spinner fillContainer />;
                }

                if (error) {
                  return <NerdGraphError error={error} />;
                }
                // console.debug(data);
                const entity = get(data, 'actor.entity');
                if (entity) {
                  const nrqlFactory = NrqlFactory.getFactory(data);
                  return (
                    <>
                      {setBrowserAppMeasures && (
                        <MeasureToggle
                          setBrowserAppMeasures={setBrowserAppMeasures}
                          nrqlFactory={nrqlFactory}
                          entity={entity}
                        />
                      )}
                      <Breakdown
                        entity={entity}
                        nrqlFactory={nrqlFactory}
                        nerdletUrlState={nerdletUrlState}
                        browserAppMeasures={browserAppMeasures}
                      />
                    </>
                  );
                } else {
                  return (
                    <div className="empty-state-container">
                      <EmptyState
                        heading="Site Analyzer is not available"
                        description="You have access to this entity, but Site Analyzer is not
                          enabled for Browser entities in this account. Please see
                          your Nerdpack Manager with concerns."
                        buttonText=""
                      />
                    </div>
                  );
                }
              }}
            </NerdGraphQuery>
          );
        }}
      </NerdletStateContext.Consumer>
    );
  }
}
