<template>
	<div class="screen-container" :style="containerStyle">
		<header class="screen-header">
			<div>
				<img :src="borderSrc" alt="" />
			</div>
			<span class="logo">
				<img :src="logoSrc" alt="" />
			</span>
			<span class="title">电商平台实时监控系统</span>
			<div class="title-right">
				<img :src="themeSrc" class="qiehuan" @click="changeTheme" />
				<span class="datetime">2049-01-01 00:00:00</span>
			</div>
		</header>
		<div class="screen-body">
			<section class="screen-left">
				<div id="left-top" :class="fullScreenStatus.trend ? 'fullscreen' : ''">
					<!-- 销量趋势图表 -->
					<Trend ref="trend"></Trend>
					<div class="resize">
						<!-- icon-expand-alt -->
						<span
							:class="[
								'iconfont',
								fullScreenStatus.trend ? 'icon-compress-alt' : 'icon-expand-alt'
							]"
							@click="changeSize('trend')"
						></span>
					</div>
				</div>
				<div
					id="left-bottom"
					:class="fullScreenStatus.seller ? 'fullscreen' : ''"
				>
					<!-- 商家销售金额图表 -->
					<Seller ref="seller"></Seller>
					<div class="resize">
						<span
							:class="[
								'iconfont',
								fullScreenStatus.seller
									? 'icon-compress-alt'
									: 'icon-expand-alt'
							]"
							@click="changeSize('seller')"
						></span>
					</div>
				</div>
			</section>
			<section class="screen-middle">
				<div id="middle-top" :class="fullScreenStatus.map ? 'fullscreen' : ''">
					<!-- 商家分布图表 -->
					<Map ref="map"></Map>
					<div class="resize">
						<span
							:class="[
								'iconfont',
								fullScreenStatus.map ? 'icon-compress-alt' : 'icon-expand-alt'
							]"
							@click="changeSize('map')"
						></span>
					</div>
				</div>
				<div
					id="middle-bottom"
					:class="fullScreenStatus.rank ? 'fullscreen' : ''"
				>
					<!-- 地区销量排行图表 -->
					<Rank ref="rank"></Rank>
					<div class="resize">
						<span
							:class="[
								'iconfont',
								fullScreenStatus.rank ? 'icon-compress-alt' : 'icon-expand-alt'
							]"
							@click="changeSize('rank')"
						></span>
					</div>
				</div>
			</section>
			<section class="screen-right">
				<div id="right-top" :class="fullScreenStatus.hot ? 'fullscreen' : ''">
					<!-- 热销商品占比图表 -->
					<Hot ref="hot"></Hot>
					<div class="resize">
						<span
							:class="[
								'iconfont',
								fullScreenStatus.hot ? 'icon-compress-alt' : 'icon-expand-alt'
							]"
							@click="changeSize('hot')"
						></span>
					</div>
				</div>
				<div
					id="right-bottom"
					:class="fullScreenStatus.stock ? 'fullscreen' : ''"
				>
					<!-- 库存销量分析图表 -->
					<Stock ref="stock"></Stock>
					<div class="resize">
						<span
							:class="[
								'iconfont',
								fullScreenStatus.stock ? 'icon-compress-alt' : 'icon-expand-alt'
							]"
							@click="changeSize('stock')"
						></span>
					</div>
				</div>
			</section>
		</div>
	</div>
</template>

<script>
	import Trend from "@/components/Trend";
	import Hot from "@/components/Hot";
	import Map from "@/components/Map";
	import Rank from "@/components/Rank";
	import Seller from "@/components/Seller";
	import Stock from "@/components/Stock";

	import { getThemeValue } from "@/utils/theme_utils";
	import { mapState } from "vuex";

	export default {
		components: {
			Trend,
			Hot,
			Map,
			Rank,
			Seller,
			Stock
		},
		data() {
			return {
				fullScreenStatus: {
					trend: false,
					seller: false,
					map: false,
					rank: false,
					hot: false,
					stock: false
				}
			};
		},
		created() {
			this.$socket.registerCallBack("fullScreen", this.recvData);
			this.$socket.registerCallBack("themeChange", this.recvThemeChange);
		},
		Unmounted() {
			this.$socket.UnregisterCallBack("fullScreen");
			this.$socket.UnregisterCallBack("themeChange");
		},
		computed: {
			...mapState(["theme"]),
			borderSrc() {
				return "/static/img/" + getThemeValue(this.theme).headerBorderSrc;
			},
			logoSrc() {
				return "/static/img/" + getThemeValue(this.theme).logoSrc;
			},
			themeSrc() {
				return "/static/img/" + getThemeValue(this.theme).themeSrc;
			},
			containerStyle() {
				return {
					backgroundColor: getThemeValue(this.theme).backgroundColor,
					color: getThemeValue(this.theme).titleColor
				};
			}
		},
		methods: {
			changeSize(chartName) {
				// 先获取目标的状态
				const targetValue = !this.fullScreenStatus[chartName];
				// 将所有图片都设置成非全屏
				// Object.keys(this.fullScreenStatus).forEach(item => {
				// 	this.fullScreenStatus[item] = false;
				// });
				// // 将目标图片设置成全屏
				// this.fullScreenStatus[chartName] = targetValue;
				// this.$nextTick(() => {
				// 	this.$refs[chartName].screenAdapter();
				// });
				this.$socket.send({
					action: "fullScreen",
					socketType: "fullScreen",
					chartName: chartName,
					value: targetValue
				});
			},
			recvData(data) {
				// 将所有图表都设置为非全屏
				Object.keys(this.fullScreenStatus).forEach(item => {
					this.fullScreenStatus[item] = false;
				});
				// 将目标图表设置为目标状态
				this.fullScreenStatus[data.chartName] = data.value;
				// 更新所有图表
				Object.keys(this.fullScreenStatus).forEach(item => {
					this.$nextTick(() => {
						this.$refs[item].screenAdapter();
					});
				});
			},
			// 切换主题
			changeTheme() {
				this.$socket.send({
					action: "themeChange",
					socketType: "themeChange",
					value: ""
				});
			},
			recvThemeChange(ret) {
				this.$store.commit("changeTheme");
			}
		}
	};
</script>

<style lang="less" scoped>
	.screen-container {
		width: 100%;
		height: 100%;
		padding: 0 20px;
		background-color: #161522;
		color: #fff;
		box-sizing: border-box;
	}
	.screen-header {
		width: 100%;
		height: 64px;
		font-size: 20px;
		position: relative;
		> div {
			img {
				width: 100%;
			}
		}
		.title {
			position: absolute;
			left: 50%;
			top: 50%;
			font-size: 20px;
			transform: translate(-50%, -50%);
		}
		.title-right {
			display: flex;
			align-items: center;
			position: absolute;
			right: 0px;
			top: 50%;
			transform: translateY(-80%);
		}
		.qiehuan {
			width: 28px;
			height: 21px;
			cursor: pointer;
		}
		.datetime {
			font-size: 15px;
			margin-left: 10px;
		}
		.logo {
			position: absolute;
			left: 0px;
			top: 50%;
			transform: translateY(-80%);
			img {
				height: 35px;
				width: 128px;
			}
		}
	}
	.screen-body {
		width: 100%;
		height: 100%;
		display: flex;
		margin-top: 10px;
		.screen-left {
			height: 100%;
			width: 27.6%;
			#left-top {
				position: relative;
				height: 53%;
			}
			#left-bottom {
				position: relative;
				height: 31%;
				margin-top: 25px;
			}
		}
		.screen-middle {
			height: 100%;
			width: 41.5%;
			margin-left: 1.6%;
			margin-right: 1.6%;
			#middle-top {
				position: relative;
				width: 100%;
				height: 56%;
			}
			#middle-bottom {
				position: relative;
				margin-top: 25px;
				width: 100%;
				height: 28%;
			}
		}
		.screen-right {
			height: 100%;
			width: 27.6%;
			#right-top {
				position: relative;
				height: 46%;
			}
			#right-bottom {
				position: relative;
				height: 38%;
				margin-top: 25px;
			}
		}
	}
	.com-container {
		position: relative;
	}
	.resize {
		position: absolute;
		top: 20px;
		right: 20px;
		cursor: pointer;
	}
	.fullscreen {
		position: fixed !important;
		top: 0 !important;
		left: 0 !important;
		width: 100% !important;
		height: 100% !important;
		margin: 0 !important;
		z-index: 100;
	}
</style>