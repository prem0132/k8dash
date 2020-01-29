import _ from 'lodash';
import React from 'react';
import Base from '../components/base';
import Chart from '../components/chart';
import Filter from '../components/filter';
import {filterByOwners} from '../utils/filterHelper';
import PodStatusChart from '../components/podStatusChart';
import {MetadataHeaders, MetadataColumns, TableBody} from '../components/listViewHelpers';
import api from '../services/api';
import test from '../utils/filterHelper';
import Working from '../components/working';
import LoadingChart from '../components/loadingChart';
import ChartsContainer from '../components/chartsContainer';
import Sorter, {defaultSortInfo} from '../components/sorter';

export default class Tasks extends Base {
    state = {
        filter: '',
        sort: defaultSortInfo(this),
    };

    setNamespace(namespace) {
        this.setState({
            cronJobs: null,
            jobs: null,
            knerrir: null,
            scheduledKnerrir: null,
        });

        this.registerApi({
            cronJobs: api.cronJob.list(namespace, x => this.setState({cronJobs: x})),
            jobs: api.job.list(namespace, x => this.setState({jobs: x})),
            pods: api.pod.list(namespace, pods => this.setState({pods})),
            knerrir: api.knerrir.list(namespace, x => this.setState({knerrir: x})),
            scheduledKnerrir: api.scheduledKnerrir.list(namespace, x => this.setState({scheduledKnerrir: x})),
        });
    }

    sort(sortBy, sortDirection) {
        this.setState({sortBy, sortDirection});
    }

    render() {
        const {cronJobs, jobs, knerrir, pods, scheduledKnerrir, sort, filter} = this.state;
        const items = [cronJobs, jobs, knerrir, scheduledKnerrir];

        const filtered = filterControllers(filter, items);
        const filteredPods = filterByOwners(pods, filtered);  

        return (
            <div id='content'>
                <Filter
                    text='Tasks'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                    onNamespaceChange={x => this.setNamespace(x)}
                />

                <ChartsContainer>
                    <ControllerStatusChart items={filtered} />
                    <PodStatusChart items={filteredPods} />
                </ChartsContainer>

                <div className='contentPanel'>
                    <table>
                        <thead>
                            <tr>
                                <MetadataHeaders includeNamespace={true} sort={sort}/>
                                <th><Sorter field={getExpectedCount} sort={sort}>Pods</Sorter></th>
                            </tr>
                        </thead>                    

                        <TableBody items={filtered} filter={filter} sort={sort} colSpan='5' row={x => (
                            <tr key={x.metadata.uid}>
                                <MetadataColumns
                                    item={x}
                                    includeNamespace={true}
                                    href={`#!tasks/${x.kind.toLowerCase()}/${x.metadata.namespace}/${x.metadata.name}`}
                                />
                                <td>
                                    <Status item={x} />
                                </td>
                            </tr>
                        )} />
                    </table>
                </div>
            </div>
        );
    }
}

function ControllerStatusChart({items}) {
    const workingItems = _.filter(items, (item) => {
        const current = getCurrentCount(item);
        const expected = getExpectedCount(item);
        return current !== expected;
    });

    const count = items && items.length;
    const pending = workingItems.length;

    return (
        <div className='charts_item'>
            {items ? (
                <Chart used={count - pending} pending={pending} available={count} />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Tasks</div>
            <div className='charts_itemSubLabel'>Ready vs Requested</div>
        </div>
    );
}


function Status({item}) {
    const current = getCurrentCount(item);
    const expected = getExpectedCount(item);
    const text = `${current} / ${expected}`;

    if (current === expected) return <span>{text}</span>;
    return <Working className='contentPanel_warn' text={text} />;
}

function getCurrentCount({status}) {
    return status.readyReplicas || status.numberReady || 0;
}

function getExpectedCount({spec, status}) {
    return spec.replicas || status.currentNumberScheduled || 0;
}

function filterControllers(filter, items) {
    const results = items
        .flat()
        .filter(x => !!x);

    // If there are no results yet but some of the workload types are still
    // loading, return "null" so we display the "loading" control
    if (!results.length && items.some(x => !x)) return null;

    return _(results)
        .flatten()
        .filter(x => test(filter, x.metadata.name))
        .value();
}
