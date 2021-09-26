<template>
	<div class="com-container">
		<div class="com-chart" ref="hot_ref"></div>
		<span class="iconfont arr_left" @click="toLfet" :style="comStyle"
			>&#xe6ef;</span
		>
		<span class="iconfont arr_right" @click="toRight" :style="comStyle"
			>&#xe6ed;</span
		>
		<span class="cat_name" :style="comStyle">{{ catTitle }}</span>
	</div>
</template>

<script>
import {mapState} from "vuex"
import {getThemeValue} from "@/utils/theme_utils"
	export default {
		data() {
			return {
				chartInstance: null,
				allData: null,
				currentIndex: 0, // 当前所展示出的一级分类数据
				titleFontSize: 0
			};
		},
		created() {
			this.$socket.registerCallBack("hotData", this.getData);
		},
		mounted() {
			this.initData();
			this.$socket.send({
				action: "getData",
				socketType: "hotData",
				chartName: "hot",
				value: ""
			});
			window.addEventListener("resize", this.screenAdapter);
			this.screenAdapter();
		},
		Unmounted() {
			window.removeEventListener("resize", this.screenAdapter);
			this.$socket.UnregisterCallBack("hotData");
		},
		computed: {
			catTitle() {
				if (!this.allData) {
					return "";
				}
				return this.allData[this.currentIndex].name;
			},
			comStyle() {
				return {
					fontSize: this.titleFontSize / 2 + "px",
					color: getThemeValue(this.theme).titleColor
				};
			},
			...mapState(['theme'])
		},
		watch:{
			theme () {
				this.chartInstance.dispose();
				this.initData();
				this.screenAdapter()
				this.updateChart();
			}
		},
		methods: {
			initData() {
				this.chartInstance = this.$echart.init(this.$refs.hot_ref, this.theme);
				const initOption = {
					tooltip: {
						trigger: "item",
						formatter: params => {
							//显示二级内容
							let tipArray = [];
							params.data.children.forEach(item => {
								let childStr = `${item.name}&nbsp;&nbsp;&nbsp;
								${parseInt((item.value / params.value) * 100) + "%"}`;
								tipArray.push(childStr);
							});
							return tipArray.join("<br/>");
						}
					},
					legend: {
						top: "15%",
						icon: "circle"
					},
					title: {
						text: "▎ 热销商品销售金额占比统计",
						left: 20,
						top: 20
					},
					series: [
						{
							type: "pie",
							label: {
								//隐藏文字
								show: false
							},
							labelLine: {
								//隐藏线
								show: false
							},
							emphasis: {
								label: {
									//高亮显示 文字
									show: true
								}
							}
						}
					]
				};
				this.chartInstance.setOption(initOption);
			},
			getData(ret) {
				// 获取服务器的数据, 对this.allData进行赋值之后, 调用updateChart方法更新图表
				this.allData = ret;
				this.updateChart();
			},
			updateChart() {
				// 处理需要的数据
				// 饼图数据
				const seriesData = this.allData[this.currentIndex].children.map(item => {
					return {
						value: item.value,
						name: item.name,
						children: item.children
					};
				});
				// 图例数据
				const legendData = this.allData[this.currentIndex].children.map(item => {
					return {
						name: item.name
					};
				});
				const dataOption = {
					legend: {
						data: legendData
					},
					series: [{ data: seriesData }]
				};
				this.chartInstance.setOption(dataOption);
			},
			screenAdapter() {
				this.titleFontSize = (this.$refs.hot_ref.offsetWidth / 100) * 3.6;
				const adapterOption = {
					title: {
						textStyle: {
							fontSize: this.titleFontSize
						}
					},
					legend: {
						itemWidth: this.titleFontSize,
						itemHeight: this.titleFontSize,
						itemGap: this.titleFontSize / 2,
						textStyle: {
							fontSize: this.titleFontSize / 2
						}
					},
					series: [
						{
							radius: this.titleFontSize * 4.5,
							center: ["50%", "60%"]
						}
					]
				};
				this.chartInstance.setOption(adapterOption);
				this.chartInstance.resize();
			},
			toLfet() {
				this.currentIndex--;
				if (this.currentIndex < 0) {
					this.currentIndex = this.allData.length - 1;
				}
				this.updateChart();
			},
			toRight() {
				this.currentIndex++;
				if (this.currentIndex > this.allData.length - 1) {
					this.currentIndex = 0;
				}
				this.updateChart();
			}
		}
	};
</script>

<style scoped style='less'>
	.arr_left {
		position: absolute;
		left: 10%;
		top: 50%;
		transform: translateY(-50%);
		cursor: pointer;
		color: white;
	}
	.arr_right {
		position: absolute;
		right: 10%;
		top: 50%;
		transform: translateY(-50%);
		cursor: pointer;
		color: white;
	}
	.cat_name {
		position: absolute;
		left: 80%;
		bottom: 20%;
		color: white;
		font-weight: bold;
	}
</style>