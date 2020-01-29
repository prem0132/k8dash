import './editorModal.scss';
import React from 'react';
import Modal from 'react-modal';
import yamljs from 'yamljs';
import Base from '../components/base';
import Button from '../components/button';
import Doc from '../components/doc';
import getDocDefinitions from '../services/docs';
import LightBulbSvg from '../art/lightBulbSvg';
import EditSvg from '../art/editSvg';
import Form from 'react-jsonschema-form';
import '../scss/journal.css'

var fullschema     = require('../components/schema/select-schema');
var uiSchema     = require('../components/schema/ui-schema');

export default class KnerrirEditorForm extends Base {
    constructor(props) {
        super(props);
        this.state = {formData: {},
            resourcetype: 'Knerrir',
            schema: fullschema.properties.Knerrir };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.selectSubmit = this.selectSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
      }

    state = {
        showDocs: false,
    };

    async componentDidMount() {
        this.findDocs(this.props.body);
    }

    async onEdit(yaml) {
        this.setState({formData: yaml});

        try {
            //const body = yamljs.parse(yaml);
            this.findDocs(yaml);
        } catch (err) {
            // Do nothing here. The current yaml can't be parsed
        }
    }

    async save() {
        const {onSave} = this.props;
        const {yaml = ''} = this.state;
        
        //const json = yamljs.parse(yaml);
        const shouldClose = await onSave(yaml);
        if (shouldClose) this.close();
    }

    async findDocs(body) {
        if (!body || !body.apiVersion || !body.kind) return;

        const result = await getDocDefinitions(body.apiVersion, body.kind);
        if (!result) return;

        this.setState({properties: result.properties});
    }

    close() {
        const {onRequestClose} = this.props;

        // To prevent the following React warning:
        // "Warning: Can't perform a React state update on an unmounted component."
        setTimeout(() => onRequestClose(), 0);
    }

    handleSubmit(e) {
        this.onEdit(e.formData)
        this.setState({yaml: e.formData});
      }

    handleChange(e) {
        this.onEdit(e.formData)
    }      

    selectSubmit(e) {
        this.setState({resourcetype: e});
        this.setState({schema: fullschema.properties[e]});
        this.setState({formData: {kind: e}});
    }      

    render() {
        const {yaml, schema, properties, showDocs} = this.state || {};
        const {body} = this.props;
        const log = (type) => console.log.bind(console, type);
        const defaultYaml = body && JSON.stringify(body, 10, 2);
        return (
            <Modal isOpen={true} className='modal_modal' overlayClassName='modal_overlay' onRequestClose={() => this.close()}>
                <div className='editorModal'>
                    <div className='editorModal_edit'>
                        <div className='editorModal_container'> 
                        <select className="browser-default custom-select" onChange={x => this.selectSubmit(x.target.value)}>
                        <option value='Knerrir' defaultValue='Knerrir'>Knerrir</option>
                        <option value="ScheduledKnerrir">Scheduled Knerrir</option>
                        </select>                                                
                        <Form className="" formData={this.state.formData} liveValidate={true}  schema={schema} uiSchema={uiSchema}
                        onChange={this.handleChange}
                        onSubmit={this.handleSubmit}
                        onError={log("errors")} /> 
                        </div>                       

                        <div hidden={!showDocs} className='editorModal_docs'>
                            {properties ? (
                                <Doc properties={properties} />
                            ) : (
                                <div className='editorModal_noDocs'>
                                    <h3>No Docs Found</h3>
                                    <div>
                                        Please enter yaml that includes an &quot;api version&quot;
                                        and &quot;kind&quot; to display help. For example
                                    </div>
                                    <pre>kind: ConfigMap</pre>
                                    <pre>apiVersion: v1</pre>
                                </div>
                            )}
                        </div>

                        <div className='modal_actions'>
                            <Button className='button_clear' onClick={() => this.setState(x => ({showDocs: !x.showDocs}))}>
                                {showDocs ? <EditSvg /> : <LightBulbSvg />}
                                <span className='button_label'>
                                    {showDocs ? 'Edit' : 'View Docs'}
                                </span>
                            </Button>
                            <div className='editorModal_spacer'></div>
                            <Button disabled={!yaml} className='button' onClick={() => this.save()}>Save</Button>
                            <Button className='button_negative' onClick={() => this.close()}>Cancel</Button>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}