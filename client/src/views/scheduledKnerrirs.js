import _ from 'lodash';
import React from 'react';
import Base from '../components/base';
import Chart from '../components/chart';
import Filter from '../components/filter';
import KnorrPodStatusChart from '../components/knorrPodStatusChart';
import {filterByOwners} from '../utils/filterHelper';
import {MetadataHeaders, MetadataColumns, TableBody} from '../components/listViewHelpers';
import Sorter, {defaultSortInfo} from '../components/sorter';
import api from '../services/api';
import test from '../utils/filterHelper';
import Working from '../components/working';
import LoadingChart from '../components/loadingChart';
import ChartsContainer from '../components/chartsContainer';

export default class ScheduledKnerrir extends Base {
    state = {
        filter: '',
        sort: defaultSortInfo(this),
    };

    setNamespace(namespace) {
        this.setState({
            scheduledKnerrir: null,
        });

        this.registerApi({
            scheduledKnerrir: api.scheduledKnerrir.list(namespace, x => this.setState({scheduledKnerrir: x})),
            knerrir: api.knerrir.list(namespace, x => this.setState({knerrir: x})),
            pods: api.pod.list(namespace, pods => this.setState({pods})),
            events: api.event.list(namespace, events => this.setState({events})),
            metrics: api.metrics.pods(namespace, metrics => this.setState({metrics})),      
        });
    }

    sort(sortBy, sortDirection) {
        this.setState({sortBy, sortDirection});
    }

    render() {
        const {scheduledKnerrir, knerrir, pods, events, metrics, sort, filter} = this.state;
        const items = [scheduledKnerrir];
        const filtered = filterControllers(filter, items);
        const filteredknerrirs = filterByOwners(knerrir, filtered);
        const filteredPods = filterByOwners(pods, filteredknerrirs);        

        return (
            <div id='content'>
                <Filter
                    text='ScheduledKnerrirs'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                    onNamespaceChange={x => this.setNamespace(x)}
                />

                <ChartsContainer>
                    <ControllerStatusChart items={filtered} />
                    <KnerrirStatusChart items={filteredknerrirs} />
                    <KnorrPodStatusChart items={filteredPods} />                 
                </ChartsContainer>

                <div className='contentPanel'>
                    <table>
                        <thead>
                            <tr>
                                <MetadataHeaders includeNamespace={true} sort={sort}/>
                                <th><Sorter field={getExpectedCount} sort={sort}>Pods</Sorter></th>
                                <th><Sorter field={getExpectedCount} sort={sort}>Schedule</Sorter></th>
                            </tr>
                        </thead>

                        <TableBody items={filtered} filter={filter} sort={sort} colSpan='5' row={x => (
                            <tr key={x.metadata.uid}>
                                <MetadataColumns
                                    item={x}
                                    includeNamespace={true}
                                    href={`#!scheduledknerrirs/${x.kind.toLowerCase()}/${x.metadata.namespace}/${x.metadata.name}`}
                                />
                                <td>
                                    <Status item={x} />
                                </td>
                                <td>
                                    { x.spec.schedule }
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
            <div className='charts_itemLabel'>Scheduled Knerrirs</div>
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
    return 1;
}

function getExpectedCount({spec, status}) {
    return 1;
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

function KnerrirStatusChart({items}) {
    const available = items && items.length;
    const count = _.sumBy(items, x => x.status.knerrir_status.state === 'COMPLETED' ? 1 : 0); // eslint-disable-line no-confusing-arrow

    return (
        <div className='charts_item'>
            {items ? (
                <Chart used={count} pending={available - count} available={available} />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Knerrirs</div>
            <div className='charts_itemSubLabel'>Completed vs Scheduled</div>
        </div>
    );
}
