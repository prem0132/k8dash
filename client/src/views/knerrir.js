import _ from 'lodash';
import KnorrPodStatusChart from '../components/knorrPodStatusChart';
import React from 'react';
import Base from '../components/base';
import ContainersPanel from '../components/containersPanel';
import PodCpuChart from '../components/podCpuChart';
import DeleteButton from '../components/deleteButton';
import EventsPanel from '../components/eventsPanel';
import Field from '../components/field';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import MetadataFields from '../components/metadataFields';
import KnorrPanel from '../components/knorrPanel';
import WaybillPanel from '../components/waybillPanel';
import PodRamChart from '../components/podRamChart';
import SaveButton from '../components/saveButton';
import api from '../services/api';
import getMetrics from '../utils/metricsHelpers';
import {filterByOwner, filterByOwners} from '../utils/filterHelper';
import {defaultSortInfo} from '../components/sorter';
import ChartsContainer from '../components/chartsContainer';

const service = api.knerrir;

export default class Knerrir extends Base {
    state = {
        podsSort: defaultSortInfo(x => this.setState({podsSort: x})),
        eventsSort: defaultSortInfo(x => this.setState({eventsSort: x})),
    }

    componentDidMount() {
        const {namespace, name} = this.props;

        this.registerApi({
            item: service.get(namespace, name, item => this.setState({item})),
            pods: api.pod.list(namespace, pods => this.setState({pods})),
            events: api.event.list(namespace, events => this.setState({events})),
            metrics: api.metrics.pods(namespace, metrics => this.setState({metrics})),
        });
    }

    render() {
        const {namespace, name} = this.props;
        const {item, pods, events, metrics, podsSort, eventsSort} = this.state;
        const filteredPods = filterByOwner(pods, item);
        const filteredEvents = filterByOwners(events, filteredPods);
        const filteredMetrics = getMetrics(filteredPods, metrics);

        return (
            <div id='content'>
                <ItemHeader title={['Knerrir', namespace, name]} ready={!!item}>
                    <>
                        <SaveButton
                            item={item}
                            onSave={x => service.put(x)}
                        />

                        <DeleteButton
                            onDelete={() => service.delete(namespace, name)}
                        />
                    </>
                </ItemHeader>


                <ChartsContainer>
                    <KnorrPodStatusChart items={filteredPods} />
                    <PodCpuChart items={filteredPods} metrics={filteredMetrics} />
                    <PodRamChart items={filteredPods} metrics={filteredMetrics} />
                </ChartsContainer>

                <div className='contentPanel'>
                    {!item ? <Loading /> : (
                        <div>
                            <MetadataFields item={item} />
                            <Field name='Start Time' value={item.metadata.creationTimestamp} />
                            <Field name='Completion Time' value={item.status.completionTime} />
                        </div>
                    )}
                </div>

                <ContainersPanel spec={item && item.spec} />
                <WaybillPanel spec={item && item.spec} />

                <div className='contentPanel_header'>Knorrs</div>
                <KnorrPanel
                    items={filteredPods}
                    sort={podsSort}
                    metrics={filteredMetrics}
                    skipNamespace={true}
                />

                <div className='contentPanel_header'>Events</div>
                <EventsPanel
                    shortList={true}
                    sort={eventsSort}
                    items={filteredEvents}
                />
            </div>
        );
    }
}