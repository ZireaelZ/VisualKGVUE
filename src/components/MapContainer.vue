<template>
  <div ref="mapDiv" id="mapDiv"></div>
</template>

<script>
import 'ol/ol.css'
import { Map, View } from "ol";
import { toLonLat } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON'
import { Vector as VectorLayer, Tile as TileLayer } from 'ol/layer'; // 引入VectorLayer模块
import { Vector as VectorSource, TileWMS ,TileArcGISRest} from 'ol/source';
// import TileLayer from "ol/layer/Tile";
import { onMounted, ref } from "vue";
import { Fill, Stroke, Style } from "ol/style";
// 引入VectorSource模块
export default {
  name: "MapContainer",
  setup() {
    const colors = ['red', 'orange', 'blue', 'green', 'pink', 'purple', 'yellow']
    let colorindex = ref(0)
    const mapDiv = ref(null)
    const map = ref(null)
    const tiled = new TileLayer({
      visible: true,
      source: new TileWMS({
        url: 'http://10.42.66.130:7777/geoserver/hubeiImage/wms',
        params: {
          'FORMAT': 'image/png',
          'VERSION': '1.1.1',
          tiled: true,
          "LAYERS": 'hubeiImage:湖北影像',
        }
      })
    });
    const arcgislayer = new TileLayer({
      visible: true,
      source: new TileArcGISRest({
        url: 'http://10.42.67.96:6080/arcgis/rest/services/2016%E5%BD%B1%E5%83%8F/MapServer',
        // params: {
        //   'FORMAT': 'image/png',
        //   'VERSION': '1.1.1',
        //   tiled: true,
        //   "LAYERS": 'hubeiImage:湖北影像',
        // }
      })
    });
    //加载父组件传入的geojson数据
    const loadGeojson = (jsonA) => {
      const features = new GeoJSON().readFeatures(jsonA)
      features.forEach(feat=>{
        const geom=feat.getGeometry()
        geom.transform('EPSG:4326','EPSG:3857')
      })
      const vectorSource = new VectorSource({
        features: features,
      });
      //按顺序指定颜色
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          fill: new Fill({
            color: 'rgba(255,0,0,0.01)'// 设置固定的填充颜色，比如红色
            
          }),
          stroke: new Stroke({
            color: colors[colorindex.value % 7], // 设置边框颜色
            width: 1
          })
        })
      });
      colorindex.value += 1
      map.value.addLayer(vectorLayer)
      map.value.getView().fit(vectorSource.getExtent(),)
    }
    onMounted(() => {
      map.value = new Map({ // 将map赋值给ref变量
        target: mapDiv.value,
        view: new View({
          center: [114,30],
          zoom: 2,
        })
      })
      // map.value.addLayer(tiled)
      map.value.addLayer(arcgislayer)
    })
    const clearmap = () => {
      colorindex.value = 0
      map.value.getLayers().clear()
      // map.value.addLayer(tiled)
      map.value.addLayer(arcgislayer)
    }
    const getextent = () => {
      // 获取当前地图显示的经纬度范围
      let extent = map.value.getView().calculateExtent(map.value.getSize());
      let newextent=[]
      newextent.push(toLonLat([extent[0],extent[1]]))
      newextent.push(toLonLat([extent[2],extent[3]]))
      return newextent

    }
    const resizemap = () => {
      // 
      map.value.updateSize()
      console.log(tiled)
      // map.value.addLayer(arcgislayer)
    }
    return {
      loadGeojson,
      map, mapDiv,
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