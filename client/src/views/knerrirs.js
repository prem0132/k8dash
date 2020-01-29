import _ from 'lodash';
import React from 'react';
import Base from '../components/base';
import Chart from '../components/chart';
import Filter from '../components/filter';
import PodCpuChart from '../components/podCpuChart';
import PodRamChart from '../components/podRamChart';
import KnorrPodStatusChart from '../components/knorrPodStatusChart';
import getMetrics from '../utils/metricsHelpers';
import {MetadataHeaders, MetadataColumns, TableBody} from '../components/listViewHelpers';
import Sorter, {defaultSortInfo} from '../components/sorter';
import api from '../services/api';
import test from '../utils/filterHelper';
import Working from '../components/working';
import {filterByOwners} from '../utils/filterHelper';
import LoadingChart from '../components/loadingChart';
import ChartsContainer from '../components/chartsContainer';

export default class Knerrirs extends Base {
    state = {
        filter: '',
        sort: defaultSortInfo(this),
        podsSort: defaultSortInfo(x => this.setState({podsSort: x})),
        eventsSort: defaultSortInfo(x => this.setState({eventsSort: x})),        
    };

    setNamespace(namespace) {
        this.setState({
            knerrir: null,
        });

        this.registerApi({
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
        const {knerrir, pods, events, metrics, sort, filter} = this.state;
        const items = [knerrir];
        const filtered = filterControllers(filter, items);
        const filteredPods = filterByOwners(pods, filtered);
        const filteredEvents = filterByOwners(events, filteredPods);
        const filteredMetrics = getMetrics(filteredPods, metrics);        

        

        return (
            <div id='content'>
                <Filter
                    text='Knerrirs'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                    onNamespaceChange={x => this.setNamespace(x)}
                />

                <ChartsContainer>
                    <ControllerStatusChart items={filtered} />
                    <KnorrPodStatusChart items={filteredPods} />
                    <PodCpuChart items={filteredPods} metrics={filteredMetrics} />
                    <PodRamChart items={filteredPods} metrics={filteredMetrics} />                    
                </ChartsContainer>

                <div className='contentPanel'>
                    <table>
                        <thead>
                            <tr>
                                <MetadataHeaders includeNamespace={true} sort={sort}/>
                                <th className='optional_xsmall'>
                                    <Sorter field={this.sortByCpuLimit} sort={sort}>
                                        Start
                                        <div className='smallText'>Time</div>
                                    </Sorter>
                                </th>
                                <th className='optional_xsmall'>
                                        <Sorter field={this.sortByCpuLimit} sort={sort}>
                                            Status
                                        </Sorter>
                                </th>    
                                <th><Sorter field={getExpectedCount} sort={sort}>Pods</Sorter></th>
                            </tr>
                        </thead>

                        <TableBody items={filtered} filter={filter} sort={sort} colSpan='5' row={x => (
                            <tr key={x.metadata.uid}>
                                <MetadataColumns
                                    item={x}
                                    includeNamespace={true}
                                    href={`#!knerrirs/${x.kind.toLowerCase()}/${x.metadata.namespace}/${x.metadata.name}`}
                                />
                                <td className='optional_medium'>{x.metadata.creationTimestamp}</td>
                                <td className='optional_medium'>{x.status.knerrir_status.state}</td>                                
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

function Status({item}) {
    const current = getCurrentCount(item);
    const expected = getExpectedCount(item);
    const text = `${current} / ${expected}`;
    if (current === expected) return <span>{text}</span>;
    return <Working className='contentPanel_warn' text={text} />;
}

function getCurrentCount({status}) {
    return status.completedKnorrs.length || 0;
}

function getExpectedCount({spec}) {
    return spec.waybill.loader.configuration.tables.length || 0;
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
