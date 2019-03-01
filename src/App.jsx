import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Button, Toolbar} from 'react-onsenui';
import {notification} from 'onsenui';

import Highcharts from 'highcharts/highstock';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.currencyHistoryURLBase = "https://api.exchangeratesapi.io/history" + 
      "?start_at=START_AT&end_at=END_AT&base=USD&symbols=KRW,JPY";
  }

  renderToolbar() {
    return (
      <Toolbar>
        <div className='center'>Onsen UI</div>
      </Toolbar>
    );
  }

  readAndDrawData() {
    var this_ = this;
    let to = new Date().toJSON().slice(0,10);
    let from = new Date();
    from.setFullYear(new Date().getFullYear() - 1);
    from = from.toJSON().slice(0, 10);
    let URL = this.currencyHistoryURLBase.replace("START_AT", from).replace("END_AT", to);

    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        let res = JSON.parse(xhr.responseText);
        let rates = res.rates;
        let dates = Object.keys(rates);
        dates.sort();

        let series = [];

        let datas = {};

        for(let i = 0; i < dates.length; i++) {
          let dateStr = dates[i];
          let dateObject = new Date(dateStr).getTime();
          let dataOfDate = rates[dateStr];
          let currencies = Object.keys(dataOfDate);
          for(let j = 0; j < currencies.length; j++) {
            let currency = currencies[j];
            let dataArr = datas[currency] == null ? [] : datas[currency];
            let data = [];
            data.push(dateObject);
            data.push(dataOfDate[currency]);
            dataArr.push(data);
            datas[currency] = dataArr;
          }
        }

        let keys = Object.keys(datas);
        for(let i = 0; i < keys.length; i++) {
          let data = {name: keys[i], data: datas[keys[i]]}
          series.push(data);
        }

        this_.drawChart(series);

        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        reject(new TypeError('API Request failed'));
      }
      xhr.open('GET', URL);
      xhr.send(null);
    });
  }

  componentDidMount() {
    this.readAndDrawData();
  }

  drawChart(data) {
    Highcharts.stockChart('container', {
      chart: {
        panning: false,
        pinchType: false
      },
      rangeSelector: {
        selected: 0
      },
      title: {
        text: 'Currency History based on USD'
      },
      credits: {
        enabled: false
      },
      legend: {
        enabled: true
      },
      xAxis: {
        type: 'datetime'
      },
      yAxis: {
        title: {
            text: 'Exchange value'
        },
        labels: {
          formatter: function () {
            return (this.value > 0 ? ' + ' : '') + this.value + '%';
          }
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: 'silver'
        }]
      },
      tooltip: {
        shared: true,
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
        valueDecimals: 2,
        split: true
      },
      plotOptions: {
        line: {
          lineWidth: 1
        },
        series: {
          compare: 'percent',
          showInNavigator: true
        }
      },
      series: data
    });
  }

  render() {
    return (
      <Page renderToolbar={this.renderToolbar}>
        <div id="container">
        </div>      
      </Page>
    );
  }
}
