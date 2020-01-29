import _ from 'lodash';
import React from 'react';
import Chart from './chart';
import LoadingChart from './loadingChart';

export default function PodStatusChart({items}) {
    const available = items && items.length;
    const count = _.sumBy(items, x => x.status.phase === 'Running' ? 1 : 0); // eslint-disable-line no-confusing-arrow

    return (
        <div className='charts_item'>
            {items ? (
                <Chart used={count} pending={available - count} available={available} />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Pods</div>
            <div className='charts_itemSubLabel'>Ready vs Requested</div>
        </div>
    );
}
