import React from 'react';
import { baseUrl } from './config/baseUrl';
import VirtualMachine from 'scratch-vm';
import ScratchStorage from 'scratch-storage';
import ScratchSVGRenderer from 'scratch-svg-renderer';
import AudioEngine from 'scratch-audio'
var greenFlag = require("../images/greenFlag.svg")
var stop = require("../images/stop.svg")

/* global ScratchRender */


export default class ScratchLoader extends React.Component {

    state = {

    }
    componentWillMount = () => {
       
        let pageHeight = document.body.clientHeight - 64 - 164;  //减去头部和底部的高度
        this.setState({
            pageHeight
        })
        let workID = this.props.id
        this.setState({ workID: workID })
        
    }
    greenFlag = () => {

        this.state.vm.greenFlag()
    }

    stop = () => {

        this.state.vm.stopAll()
    }

    renderCanvas = () => {

        window.devicePixelRatio = 1;

        var canvas = document.getElementById('scratchRender');
        var render = new ScratchRender(canvas);

        var vm = new VirtualMachine();
        var storage = new ScratchStorage();
        var audioEngine = new AudioEngine();


        this.setState({ vm: vm })


        vm.attachStorage(storage);
        vm.attachRenderer(render);
        vm.attachV2SVGAdapter(new ScratchSVGRenderer.SVGRenderer());
        vm.attachV2BitmapAdapter(new ScratchSVGRenderer.BitmapAdapter());
        vm.attachAudioEngine(audioEngine);



        // Feed mouse events as VM I/O events.
        document.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            const coordinates = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                canvasWidth: rect.width,
                canvasHeight: rect.height
            };
            vm.postIOData('mouse', coordinates);
        });
        canvas.addEventListener('mousedown', e => {

            const rect = canvas.getBoundingClientRect();

            const data = {
                isDown: true,
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                canvasWidth: rect.width,
                canvasHeight: rect.height
            };
            vm.postIOData('mouse', data);
            e.preventDefault();
        });
        canvas.addEventListener('mouseup', e => {
            const rect = canvas.getBoundingClientRect();
            const data = {
                isDown: false,
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                canvasWidth: rect.width,
                canvasHeight: rect.height
            };
            vm.postIOData('mouse', data);
            e.preventDefault();
        });


        // Feed keyboard events as VM I/O events.
        document.addEventListener('keydown', e => {

            // Don't capture keys intended for Blockly inputs.
            if (e.target !== document && e.target !== document.body) {
                return;
            }

            vm.postIOData('keyboard', {
                key:e.key,
                keyCode: e.keyCode,
                isDown: true
            });
            e.preventDefault();
        });

        document.addEventListener('keyup', e => {
            // Always capture up events,
            // even those that have switched to other targets.

            vm.postIOData('keyboard', {
                key:e.key,
                keyCode: e.keyCode,
                isDown: false
            });
            // E.g., prevent scroll.
            if (e.target !== document && e.target !== document.body) {
                e.preventDefault();
            }
        });

        var request = new XMLHttpRequest();
        let fileName = this.state.workID + '.sb3'
        request.open('GET', `${baseUrl}asset/works/` + fileName, true);
        request.responseType = 'blob';
        request.onload = function () {
            var reader = new FileReader();
            reader.readAsArrayBuffer(request.response);
            reader.onload = function (e) {
                vm.start();
                vm.loadProject(reader.result)
                    .then(() => {

                    });
            };
        };
        request.send();
    }

    componentDidMount = () => {
        let _this = this;
         //加载scratch 需要的文件。
         let script = document.querySelector('#script');
         if (script) {
           this.renderCanvas();
           return;
         }
         script = document.createElement('script');
         script.id = 'script';
         script.src = 'https://static.allinfun.cn/maiyajia/xueyuan/scratch-render.js';
         document.querySelector('body').appendChild(script);
         script.onload = function () {
            _this.renderCanvas();
         }
        
    }


    render() {
        return (
            <div style={{ margin: '0 auto', width: '480px', boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2) 0 6px 20px 0 rgba(0,0,0,0.19)' }}>
                <div style={{ height: '40px', background: '#e5f0ff' }}>
                    <div onClick={this.greenFlag}><img src={greenFlag} alt='开始' style={{ width: '32px', height: '32px', float: 'left', marginRight: '20px', marginLeft: '10px', marginTop: '4px' }} /></div>
                    <div onClick={this.stop}><img src={stop} alt='暂停' style={{ width: '32px', height: '32px', float: 'left', marginRight: '20px', marginLeft: '10px', marginTop: ' 4px' }} /></div>
                </div>
                <div style={{ clear: 'both' }}></div>
                <div>
                    <canvas id="scratchRender" width="480" height="360" ></canvas>
                </div>
            </div>
        );
    }
}