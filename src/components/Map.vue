<template>
	<div class="com-container" @dblclick="revertMap">
		<div class="com-chart" ref="map_ref"></div>
	</div>
</template>

<script>
	import axios from "axios";
	import {mapState} from "vuex"
	import { getProvinceMapInfo } from "@/utils/map_utils";
	export default {
		data() {
			return {
				chartInstance: null,
				allData: null, // 获取服务器的数据
				mapData: {} // 所获取的省份的地图矢量数据
			};
		},
		created() {
			this.$socket.registerCallBack("mapData", this.getData);
		},
		mounted() {
			this.initChart();
			this.$socket.send({
				action: "getData",
				socketType: "mapData",
				chartName: "map",
				value: ""
			});
			window.addEventListener("resize", this.screenAdapter);
			this.screenAdapter();
		},
		Unmounted() {
			window.removeEventListener("resize", this.screenAdapter);
			this.$socket.UnregisterCallBack("mapData");
		},
		methods: {
			// 初始化图表
			async initChart() {
				this.chartInstance = this.$echart.init(this.$refs.map_ref, this.theme);

				// 获取中国地图的矢量数据
				// http://localhost:8999/static/map/china.json
				// 由于我们现在获取的地图矢量数据并不是位于KOA2的后台, 所以咱们不能使用this.$http
				const { data: ret } = await axios.get(
					"http://localhost:8999/static/map/china.json"
				);
				this.$echart.registerMap("china", ret);
				const initOption = {
					title: {
						text: "▎ 商家分布",
						left: 20,
						top: 20
					},
					geo: {
						type: "map",
						map: "china",
						top: "5%",
						bottom: "5%",
						itemStyle: {
							areaColor: "#2E72BF",
							borderColor: "#333"
						}
					},
					legend: {
						left: "5%",
						bottom: "5%",
						orient: "vertical"
					}
				};
				this.chartInstance.setOption(initOption);

				// 点击省份  显示省
				this.chartInstance.on("click", async arg => {
					// arg.name 得到所点击的省份, 这个省份他是中文
					const provinceInfo = getProvinceMapInfo(arg.name);
					// 对获取各个省份的矢量数据进行缓存
					// 判断当前点击的省份的地图矢量数据在mapData中是否存在
					if (!this.mapData[provinceInfo.key]) {
						const ret1 = await axios.get(
							`http://localhost:8999${provinceInfo.path}`
						);
						this.mapData[provinceInfo.key] = ret1.data;
						this.$echart.registerMap(provinceInfo.key, ret1.data);
					}

					const changeOption = {
						geo: {
							map: provinceInfo.key
						}
					};
					this.chartInstance.setOption(changeOption);
				});
			},
			// 获取数据
			 getData(ret) {
				// 获取服务器的数据 对allData进行赋值 ，调用UpdateChart
				this.allData = ret;
				this.updateChart();
			},
			updateChart() {
				// 处理图表所需要的数据
				const legendArr = this.allData.map(item => {
					return item.name;
				});
				const seriesArr = this.allData.map(item => {
					return {
						type: "effectScatter",
						coordinateSystem: "geo",
						data: item.children,  //item.children为一个同类型的数组
						name: item.name, //使得名字与图例保持一致
						rippleEffect: {
							scale: 5,
							brushType: "stroke" //空心的涟漪效果
						}
					};
				});
				const dataOption = {
					legend: {
						data: legendArr
					},
					series: seriesArr
				};
				this.chartInstance.setOption(dataOption);
			},
			screenAdapter() {
				const titleFontSize = (this.$refs.map_ref.offsetWidth / 100) * 3.6;
				const adapterOption = {
					title: {
						textStyle: {
							fontSize: titleFontSize
						}
					},
					legend: {
						itemWidth: titleFontSize / 2,
						itemHeight: titleFontSize / 2,
						itemGap: titleFontSize / 2, //图例之间的间隔
						textStyle: {
							fontSize: titleFontSize / 2
						}
					}
				};
				this.chartInstance.setOption(adapterOption);
				this.chartInstance.resize();
			},
			// 回到中国地图
			revertMap() {
				const revertOption = {
					geo: {
						map: "china"
					}
				};
				this.chartInstance.setOption(revertOption);
			}
		},
		computed :{
			...mapState(['theme'])
		},
		watch:{
			theme () {
				this.chartInstance.dispose();
				this.initChart();
				this.screenAdapter();
				this.updateChart()
			}
		}

	};
</script>

<style scoped>
</style>