import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import api from '../services/api';
import test from '../utils/filterHelper'
import PodCpuChart from '../components/podCpuChart';
import PodRamChart from '../components/podRamChart';
import KnorrsPanel from '../components/knorrPanel';
import PodStatusChart from '../components/podStatusChart';
import {defaultSortInfo} from '../components/sorter';
import getMetrics from '../utils/metricsHelpers';
import ChartsContainer from '../components/chartsContainer';

export default class Knorr extends Base {
    state = {
        namespace: '',
        filter: '',
        sort: defaultSortInfo(this),
    };

    setNamespace(namespace) {
        this.setState({namespace});
        this.setState({items: null});

        this.registerApi({
            items: api.pod.list(namespace, items => this.setState({items})),

            metrics: api.metrics.pods(namespace, metrics => this.setState({metrics})),
        });
    }

    render() {
        const {items, metrics, namespace, sort, filter} = this.state;
        const filtereditems = filterKnorrs(items, 'knorr');
        const filtered = filtereditems && filtereditems.filter(x => test(filter, x.metadata.name));
        const filteredMetrics = getMetrics(filtered, metrics);

        return (
            <div id='content'>
                <Filter
                    text='Knorrs'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                    onNamespaceChange={x => this.setNamespace(x)}
                />

                <ChartsContainer>
                    <PodStatusChart items={filtered} />
                    <PodCpuChart items={filtered} metrics={filteredMetrics} />
                    <PodRamChart items={filtered} metrics={filteredMetrics} />
                </ChartsContainer>

                <KnorrsPanel
                    items={filtered}
                    filter={filter}
                    sort={sort}
                    metrics={filteredMetrics}
                    skipNamespace={!!namespace}
                />
            </div>
        );
    }
}

function filterKnorrs(items, filter) {
    if (!items) return null;

    return items.filter((x) => {
        const labels = x.metadata.labels || {};
        const searchableLabels = Object.entries(labels).flat();
        return test(filter, x.metadata.name, ...searchableLabels);
    });
}