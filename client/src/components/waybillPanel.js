import _ from 'lodash';
import React, {Fragment} from 'react';
import Field from './field';
import {List} from './listViewHelpers';

const WaybillPanel = ({spec}) => (
    <>
        {spec && spec.waybill.loader && (
            <Fragment key={spec.waybill.loader.system}>
            <div className='contentPanel_header'>Unloader</div>
            <div key={spec.waybill.loader.system} className='contentPanel'>                
            <Field name='Loader System'>{spec.waybill.loader.system}</Field>   
            {spec.waybill.loader.configuration && spec.waybill.loader.configuration.host && (
                <>
                    <Field name='Host'>{spec.waybill.loader.configuration.host}</Field>
                </>
            )} 
            {spec.waybill.loader.configuration && spec.waybill.loader.configuration.port && (
                <>
                    <Field name='Port'>{spec.waybill.loader.configuration.port}</Field>
                </>
            )}    
            {spec.waybill.loader.configuration && spec.waybill.loader.configuration.user && (
                <>
                    <Field name='User'>{spec.waybill.loader.configuration.user}</Field>
                </>
            )}   
            {spec.waybill.loader.configuration && spec.waybill.loader.configuration.db && (
                <>
                    <Field name='Database'>{spec.waybill.loader.configuration.db}</Field>
                </>
            )}   
            {spec.waybill.loader.configuration.tables &&  (
                <>
                    <Field name='Tables'>
                    {List(spec.waybill.loader.configuration.tables)}
                    </Field>
                </>
            )}                                              
            {spec.waybill.loader.configuration && spec.waybill.loader.configuration.load_type && (
                <>
                    <Field name='Load Type'>{spec.waybill.loader.configuration.load_type}</Field>
                </>
            )} 
            {spec.waybill.loader.configuration && spec.waybill.loader.configuration.loader_type && (
                <>
                    <Field name='Loader Type'>{spec.waybill.loader.configuration.loader_type}</Field>
                </>
            )}  
            {spec.waybill.loader.configuration && spec.waybill.loader.configuration.chunk_size && (
                <>
                    <Field name='chunk_size'>{spec.waybill.loader.configuration.chunk_size}</Field>
                </>
            )}                                                                                                                                    
            </div>
            </Fragment>
        )}
        {spec && _.map(spec.waybill.unloaders, item => (
            <Fragment key={item.name}>
                <div className='contentPanel_header'>Unloader</div>
                <div key={item.system} className='contentPanel'>
                    <Field name='Unloader System'>{item.system}</Field>
                    {item.configuration && item.configuration.dataset && (
                        <>
                            <Field name='Dataset'>{item.configuration.dataset}</Field>
                        </>
                    )}     
                    {item.configuration && item.configuration.project_id && (
                        <>
                            <Field name='Project ID'>{item.configuration.project_id}</Field>
                        </>
                    )} 
                    {item.configuration && item.configuration.table && (
                        <>
                            <Field name='Table'>{item.configuration.table}</Field>
                        </>
                    )} 
                    {item.configuration && item.configuration.write_type && (
                        <>
                            <Field name='Write Type'>{item.configuration.write_type}</Field>
                        </>
                    )} 
                    {item.configuration && item.configuration.location && (
                        <>
                            <Field name='Location'>{item.configuration.location}</Field>
                        </>
                    )}                                                                                                     
                    {item.configuration && item.configuration.blob_base && (
                        <>
                            <Field name='Blob Base'>{item.configuration.blob_base}</Field>
                        </>
                    )}          
                    {item.configuration && item.configuration.bucket && (
                        <>
                            <Field name='Bucket'>{item.configuration.bucket}</Field>
                        </>
                    )}          
                    {item.configuration && item.configuration.output_type && (
                        <>
                            <Field name='Output Type'>{item.configuration.output_type}</Field>
                        </>
                    )}          
                    {item.configuration && item.configuration.partition_on && (
                        <>
                            <Field name='Partition On'>{item.configuration.partition_on}</Field>
                        </>
                    )}          
                    {item.external && item.external.create && (
                        <>
                            <Field name='Link as External Table'>{"true"}</Field>
                        </>
                    )}                                                                                                                                                        
                </div>
            </Fragment>
        ))}
    </>
);

export default WaybillPanel;
