import React, { useState, useEffect, useRef } from 'react'

import { createChart } from 'lightweight-charts'
import dayjs from 'dayjs'
import { formattedNum } from '../../utils'
import { useMedia } from 'react-use'

const CustomAreaChart = ({ data, base, baseChange, title, field }) => {
  const ref = useRef()

  var width = 400
  var height = 300

  const below1180 = useMedia('(max-width: 1180px)')
  const below800 = useMedia('(max-width: 800px)')

  const [chartCreated, setChartCreated] = useState(false)

  const formattedData = data?.map(entry => {
    return {
      time: dayjs.unix(entry.date).format('YYYY-MM-DD'),
      value: parseFloat(entry[field])
    }
  })

  useEffect(() => {
    if (!chartCreated && formattedData) {
      var chart = createChart(ref.current, {
        width: width,
        height: height,
        rightPriceScale: {
          scaleMargins: {
            top: 0.35,
            bottom: 0.2
          },
          borderVisible: false
        },
        timeScale: {
          borderVisible: false
        },
        grid: {
          horzLines: {
            color: '#eee',
            visible: false
          },
          vertLines: {
            color: '#ffffff'
          }
        },
        crosshair: {
          horzLine: {
            visible: false,
            labelVisible: false
          },
          vertLine: {
            visible: true,
            style: 0,
            width: 2,
            color: 'rgba(32, 38, 46, 0.1)',
            labelVisible: false
          }
        }
      })

      var series = chart.addAreaSeries({
        topColor: '#ff007a',
        bottomColor: 'rgba(255, 0, 122, 0)',
        lineColor: '#ff007a',
        lineWidth: 3
      })

      series.setData(formattedData)

      var toolTip = document.createElement('div')

      toolTip.className = 'three-line-legend'

      ref.current.appendChild(toolTip)
      toolTip.style.display = 'block'
      toolTip.style.left = 3 + 'px'
      toolTip.style.top = 3 + 'px'

      let percentChange = baseChange?.toFixed(2)
      let formattedPercentChange = (percentChange > 0 ? '+' : '-') + percentChange + '%'

      function setLastBarText() {
        var dateStr =
          dayjs()
            .year()
            .toString() +
          ' - ' +
          (dayjs().month() + 1).toString() +
          ' - ' +
          dayjs()
            .date()
            .toString()
        toolTip.innerHTML =
          `<div style="font-size: 16px; margin: 4px 0px; color: #20262E;">${title}</div>` +
          '<div style="font-size: 22px; margin: 4px 0px; color: #20262E">' +
          formattedNum(base, true) +
          `<span style="margin-left: 10px; font-size: 16px; color: green;">${formattedPercentChange}</span>` +
          '</div>' +
          '<div>' +
          dateStr +
          '</div>'
      }
      setLastBarText()
      chart.subscribeCrosshairMove(function(param) {
        if (
          param === undefined ||
          param.time === undefined ||
          param.point.x < 0 ||
          param.point.x > width ||
          param.point.y < 0 ||
          param.point.y > height
        ) {
          setLastBarText()
        } else {
          let dateStr = param.time.year + ' - ' + param.time.month + ' - ' + param.time.day
          var price = param.seriesPrices.get(series)

          toolTip.innerHTML =
            `<div style="font-size: 16px; margin: 4px 0px; color: #20262E;">${title}</div>` +
            '<div style="font-size: 22px; margin: 4px 0px; color: #20262E">' +
            formattedNum(price, true) +
            '</div>' +
            '<div>' +
            dateStr +
            '</div>'
        }
      })

      setChartCreated(chart)
    }
  }, [base, baseChange, chartCreated, data, formattedData, height, title, width])

  // responsiveness

  useEffect(() => {
    if (below1180) {
      chartCreated && chartCreated.resize(320, height)
    }
    if (below800) {
      chartCreated && chartCreated.resize(800, height)
    }
  })

  return <div ref={ref} />
}

export default CustomAreaChart