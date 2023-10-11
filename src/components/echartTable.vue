<template>
  <div>
    <div ref='echartsT' style="height: 300px;width: 800px"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import {ref, onMounted, onBeforeUnmount,} from "vue";
//
export default {
  name: "echartTable",
  setup() {
    const echartsT = ref()
    onMounted(() => {
      echartsT.value = echarts.init(echartsT.value)
    })
    onBeforeUnmount(()=>{
      echartsT.value.clear()
    })
    const clearechart=()=>{
      echartsT.value.clear()
    }
    const resolvedata=(data)=>{
      console.log(data)
      //先考虑buffer500
      const source=ref([])
      const years=['year']
      const types=[]
      const series=ref([])
      //获取土地利用类型有哪些
      Object.keys(data).forEach((year)=>{
        years.push(year)
        series.value.push({ type: 'bar' })
        Object.keys(data[year]).forEach((type)=>{
          if(!types.includes(type)){
            types.push(type)
          }
        })
      })
      source.value.push(years)
      types.forEach((type)=>{
        let tmptype=[type]
        Object.keys(data).forEach((year)=>{
          if(Object.prototype.hasOwnProperty.call(data[year], type)){
            tmptype.push(data[year][type])
          }
          else tmptype.push(0.01)
        })
        source.value.push(tmptype)
      })
      const options={
        legend:{},
        tooltip:{},
        dataset:{
          source:source.value
        },
        xAxis:{type:'category'},
        yAxis:{},
        series:series.value
      }
      echartsT.value.setOption(options)

    }
    return {
      echartsT,
      resolvedata,
      clearechart,
    }
  }
}
</script>

<style scoped>

</style>