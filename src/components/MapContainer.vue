<template>
  <div ref="mapDiv" id="mapDiv" ></div>
</template>

<script>
import 'ol/ol.css'
import {Map, View} from "ol";
import GeoJSON from 'ol/format/GeoJSON'
import {Vector as VectorLayer} from 'ol/layer'; // 引入VectorLayer模块
import { Vector as VectorSource} from 'ol/source';
// import TileLayer from "ol/layer/Tile";
import {onMounted, ref} from "vue";
import {Fill, Stroke, Style} from "ol/style";
// 引入VectorSource模块
export default {
  name: "MapContainer",
  setup() {
    const colors=['red','orange','blue','green','pink','purple','yellow']
    let colorindex=ref(0)
    const mapDiv = ref(null)
    const map = ref(null)
    //加载父组件传入的geojson数据
    const loadGeojson = (jsonA) => {
      const features = new GeoJSON().readFeatures(jsonA)
      const vectorSource = new VectorSource({
        features: features,
      });
      //按顺序指定颜色
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style:new Style({
          fill: new Fill({
            color: colors[colorindex.value%7]// 设置固定的填充颜色，比如红色
          }),
          stroke: new Stroke({
            color: colors[colorindex.value%7], // 设置边框颜色
            width: 1
          })
        })
      });
      colorindex.value+=1
      map.value.addLayer(vectorLayer)
      map.value.getView().fit(vectorSource.getExtent(),{padding:[50,50,50,50]})
    }
    onMounted(() => {
      map.value = new Map({ // 将map赋值给ref变量
        target: mapDiv.value,
        view: new View({
          center: [0, 0],
          zoom: 2
        })
      })
      // map.value.on('click', () => {
      //   console.log(colorindex.value)
      // })
    })
    const clearmap=()=>{
      colorindex.value=0
      map.value.getLayers().clear()
    }
    const getextent=()=>{
      // 获取当前地图显示的经纬度范围
      let extent = map.value.getView().calculateExtent(map.value.getSize());
      console.log(extent); // 输出结果为 [minX, minY, maxX, maxY]
    }
    const resizemap=()=>{
      map.value.updateSize()
    }
    return {
      loadGeojson,
      map,mapDiv,
      clearmap,
      getextent,
      resizemap
    }
  },

}
</script>
<style scoped>
#mapDiv {
  height: 100%;
  width: 100%;
  margin: 0;
  /*background-color: antiquewhite;*/
}
</style>