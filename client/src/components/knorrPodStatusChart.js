import _ from 'lodash';
import React from 'react';
import Chart from './chart';
import LoadingChart from './loadingChart';

export default function KnorrPodStatusChart({items}) {
    const available = items && items.length;
    const count = _.sumBy(items, x => x.status.phase === 'Running' || x.status.phase === 'Succeeded' ? 1 : 0); // eslint-disable-line no-confusing-arrow

    return (
        <div className='charts_item'>
            {items ? (
                <Chart used={count} pending={available - count} available={available} />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Knorrs</div>
            <div className='charts_itemSubLabel'>Succeeded vs Scheduled</div>
        </div>
    );
}
