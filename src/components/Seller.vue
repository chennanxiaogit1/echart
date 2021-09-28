<!-- 商家销量统计的横向柱状图 -->
<template>
	<div class="com-container">
		<div class="com-chart" ref="seller_ref"></div>
	</div>
</template>

<script>
import {mapState} from "vuex"
	export default {
		data() {
			return {
				chartInstance: null,
				allData: null, //服务器返回的数据
				currentPage: 1, //当前显示的页数
				totalPage: 0, //一共有多少页数据
				timeId: null //定时器的标识
			};
		},
		created() {
			this.$socket.registerCallBack("sellerData",this.getData)
		},
		mounted() {
			this.initChart();
			this.$socket.send({
				action:"getData",
				socketType:"sellerData",
				chartName:"seller",
				value:''
			})
			// 浏览器屏幕大小发生变化
			window.addEventListener("resize", this.screenAdapter);
			// 页面加载成功，主动与屏幕进行适配
			this.screenAdapter();
		},
		Unmounted() {
			clearInterval(this.timeId);
			window.removeEventListener("resize", this.screenAdapter);
			this.$socket.UnregisterCallBack("sellerData")
		},
		computed :{
			...mapState(['theme'])
		},
		watch:{
			theme () {
				this.chartInstance.dispose();
				this.initChart();
				this.screenAdapter();
				this.UpdateChart()
			}
		},
		methods: {
			// 初始化echartInstance对象
			initChart() {
				this.chartInstance = this.$echart.init(this.$refs.seller_ref, this.theme);
				// 对图表的初始化配置的控制
				const initOption = {
					title: {
						text: "▎商家销售统计",
						top: 20,
						left: 20,
					},
					grid: {
						top: "20%",
						left: "3%",
						right: "6%",
						bottom: "3%",
						containLabel: true //距离包含坐标轴文字
					},
					xAxis: {
						type: "value"
					},
					yAxis: {
						type: "category"
					},
					tooltip: {
						// 设置触发的方式
						trigger: "axis",
						axisPointer: {
							type: "line",
							z: 0, //层级
							lineStyle: {
								color: "#2D3443",
							}
						}
					},
					series: [
						{
							type: "bar",
							label: {
								show: true,
								position: "right",
								textStyle: {
									color: "white"
								}
							},
							itemStyle: {
								// 控制颜色的渐变方向
								// 指明不同百分比下的颜色
								color: new this.$echart.graphic.LinearGradient(0, 0, 0, 1, [
									{ offset: 0, color: "#5052EE" }, //百分之0下的颜色
									{ offset: 1, color: "#AB6EE5" } //百分之100下的颜色
								])
							}
						}
					]
				};
				this.chartInstance.setOption(initOption);
				// 对图表对象进行鼠标事件的监听
				this.chartInstance.on("mouseover", () => {
					clearInterval(this.timeId);
				});
				this.chartInstance.on("mouseout", () => {
					this.startInterval();
				});
			},
			// 获取服务器的数据
			 getData(ret) {
				this.allData = ret;
				// 对数据进行排序
				this.allData.sort((a, b) => a.value - b.value);
				this.totalPage =
					this.allData.length % 5 === 0
						? this.allData.length / 5
						: this.allData.length / 5 + 1;
				this.UpdateChart();
				// 启动定时器
				this.startInterval();
			},
			// 更新图表
			UpdateChart() {
				const start = (this.currentPage - 1) * 5;
				const end = this.currentPage * 5;
				const showData = this.allData.slice(start, end);
				const sellerNames = showData.map(item => item.name);
				const sellerValues = showData.map(item => item.value);
				const dataOption = {
					yAxis: {
						data: sellerNames  //商家名称
					},
					series: [{ data: sellerValues  }] //对应商家的值
				};
				this.chartInstance.setOption(dataOption);
			},
			// 数据的动态加载
			startInterval() {
				if (this.timeId) {
					clearInterval(this.timeId);
				}
				this.timeId = setInterval(() => {
					this.currentPage++;
					if (this.currentPage > this.totalPage) {
						this.currentPage = 1;
					}
					this.UpdateChart();
				}, 3000);
			},
			// 当浏览器大小发生变化的时候,会调用的方法,完成屏幕的适配
			screenAdapter() {
				// console.log(this.$refs.seller_ref.offsetWidth);
				const titleFontSize = (this.$refs.seller_ref.offsetWidth / 100) * 3.6;
				// 和分辨率大小相关配置
				const adapterOption = {
					title: {
						textStyle: {
							fontSize: titleFontSize
						}
					},
					tooltip: {
						axisPointer: {
							lineStyle: {
								width: titleFontSize
							}
						}
					},
					series: [
						{
							barWidth: titleFontSize,
							itemStyle: {
								barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0]
							}
						}
					]
				};
				this.chartInstance.setOption(adapterOption);
                // 手动调用图表的resize方法 才能生效
                this.chartInstance.resize();
			}
		}
	};
</script>

<style style='less' scoped>
</style>