import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import api from '../services/api';
import test from '../utils/filterHelper'
import PodCpuChart from '../components/podCpuChart';
import PodRamChart from '../components/podRamChart';
import PodsPanel from '../components/podsPanel';
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
        //this.setState({knerrirs: null});

        this.registerApi({
            items: api.pod.list(namespace, items => this.setState({items})),
            //knerrir: api.knerrir.list(namespace, x => this.setState({knerrir: x})),
            metrics: api.metrics.pods(namespace, metrics => this.setState({metrics})),
        });
    }

    render() {
        const {items, metrics, namespace, sort, filter} = this.state;
        console.log(items)
        //const filtered = items && items.filter(x => test("knorr", x.metadata.ownerReferences[0].kind));
        const filtered = filterKnorrs(items, 'knorr');
        const filteredMetrics = getMetrics(filtered, metrics);
        console.log(filtered)

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

                <PodsPanel
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