<template>
	<div class="com-container">
		<div class="com-chart" ref="stock_ref"></div>
	</div>
</template>

<script>
import {mapState} from "vuex"
	export default {
		data() {
			return {
				chartInstance: null,
				allData: null,
				currentIndex: 0, //记录当前的页数
				timeId: null,
				titleFontSize: 0
			};
		},
		created() {
			this.$socket.registerCallBack("stockData",this.getData)
		},
		mounted() {
			this.initData();
			// this.getData();
			this.$socket.send({
				action:'getData',
				socketType:"stockData",
				chartName:'stock',
				value:''
			})
			window.addEventListener("resize", this.screenAdapter);
			this.screenAdapter();
			this.startInterval();
		},
		Unmounted() {
			window.removeEventListener("resize", this.screenAdapter);
			clearInterval(this.timeId);
			this.$socket.UnregisterCallBack("stockData")
		},
		computed:{
			...mapState(['theme'])
		},
		watch:{
			theme () {
				this.chartInstance.dispose();
				this.initData();
				this.screenAdapter();
				this.updateChart()
			}
		},
		methods: {
			initData() {
				this.chartInstance = this.$echart.init(this.$refs.stock_ref, this.theme);
				// 5个圆环对应的圆心点
				const centerPointers = [
					["18%", "40%"],
					["50%", "40%"],
					["82%", "40%"],
					["34%", "75%"],
					["66%", "75%"]
				];
				const initOption = {
					title: {
						text: "▎ 库存销售量",
						left: 20,
						top: 20
					},
					series: [
						{
							type: "pie",
							center: centerPointers[0],
							hoverAnimation: false, //鼠标移入动画效果的移除
							label: {
								show: true,
								position: "center"
							},
							labelLine: {
								//指示线的移除
								show: false
							}
						},
						{
							type: "pie",
							center: centerPointers[1],
							hoverAnimation: false, //鼠标移入动画效果的移除
							label: {
								show: true,
								position: "center"
							},
							labelLine: {
								//指示线的移除
								show: false
							}
						},
						{
							type: "pie",
							center: centerPointers[2],
							hoverAnimation: false, //鼠标移入动画效果的移除
							label: {
								show: true,
								position: "center"
							}
						},
						{
							type: "pie",
							center: centerPointers[3],
							hoverAnimation: false, //鼠标移入动画效果的移除
							label: {
								show: true,
								position: "center"
							},
							labelLine: {
								//指示线的移除
								show: false
							}
						},
						{
							type: "pie",
							center: centerPointers[4],
							hoverAnimation: false, //鼠标移入动画效果的移除
							label: {
								show: true,
								position: "center"
							},
							labelLine: {
								//指示线的移除
								show: false
							}
						}
					]
				};
				this.chartInstance.on("mouseover", () => {
					clearInterval(this.timeId);
				});
				this.chartInstance.on("mouseout", () => {
					this.startInterval();
				});
				this.chartInstance.setOption(initOption);
			},
			 getData(ret) {
				// 获取服务器的数据, 对this.allData进行赋值之后, 调用updateChart方法更新图表
				this.allData = ret;
				this.updateChart();
			},
			updateChart() {
				// 处理数据

				// 增加5个圆环的渐变颜色范围
				const colorArrs = [
					["#4FF778", "#0BA82C"],
					["#E5DD45", "#E8B11C"],
					["#E8821C", "#E55445"],
					["#5052EE", "#AB6EE5"],
					["#23E5E5", "#2E72BF"]
				];

				// 先显示前5条数据
				const start = this.currentIndex * 5;
				const end = (this.currentIndex + 1) * 5;
				const showData = this.allData.slice(start, end);
				console.log(showData);
				const seriesArr = showData.map((item, index) => {
					return {
						label: {
							color: colorArrs[index][0]
						},
						// radius: [110, 100], //饼图的半径 一个是内圆 一个是外圆
						data: [
							{
								value: item.sales,
								name: item.name + "\n\n" + item.sales,
								itemStyle: {
									color: new this.$echart.graphic.LinearGradient(0, 1, 0, 0, [
										{ offset: 0, color: colorArrs[index][0] },
										{ offset: 1, color: colorArrs[index][1] }
									])
								}
							},
							{
								value: item.stock,
								itemStyle: {
									color: "#333843"
								}
							}
						]
					};
				});
				const dataOption = {
					series: seriesArr
				};
				this.chartInstance.setOption(dataOption);
			},
			screenAdapter() {
                // console.log(this.$refs.stock_ref.offsetWidth);
				this.titleFontSize = (this.$refs.stock_ref.offsetWidth / 100) * 3.6;
				const innerRadius = this.titleFontSize * 2.8;
				const outterRadius = innerRadius * 1.125;
				const adapterOption = {
					title: {
						textStyle: {
							fontSize: this.titleFontSize
						}
					},
					series: [
						{
							radius: [outterRadius, innerRadius],
							label: {
								fontSize: this.titleFontSize / 2
							}
						},
						{
							radius: [outterRadius, innerRadius],
							label: {
								fontSize: this.titleFontSize / 2
							}
						},
						{
							radius: [outterRadius, innerRadius],
							label: {
								fontSize: this.titleFontSize / 2
							}
						},
						{
							radius: [outterRadius, innerRadius],
							label: {
								fontSize: this.titleFontSize / 2
							}
						},
						{
							radius: [outterRadius, innerRadius],
							label: {
								fontSize: this.titleFontSize / 2
							}
						}
					]
				};
				this.chartInstance.setOption(adapterOption);
				this.chartInstance.resize();
			},
			startInterval() {
				if (this.timeId) {
					clearInterval(this.timeId);
				}
				this.timeId = setInterval(() => {
					this.currentIndex++;
					if (this.currentIndex > 1) {
						this.currentIndex = 0;
					}
					this.updateChart();
				}, 3000);
			}
		}
	};
</script>

<style>
</style>