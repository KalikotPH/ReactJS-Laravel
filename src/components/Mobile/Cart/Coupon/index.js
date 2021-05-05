import React, { Component } from "react";

import Ink from "react-ink";
import { applyCoupon } from "../../../../services/coupon/actions";
import { connect } from "react-redux";

class Coupon extends Component {
	state = {
		inputCoupon: "",
		couponFailed: false,
		couponFailedType: "",
		couponErrorMessage: "",
	};

	componentDidMount() {
		// automatically apply coupon if already exists in localstorage
		if (localStorage.getItem("appliedCoupon")) {
			this.setState({ inputCoupon: localStorage.getItem("appliedCoupon") }, () => {
				this.refs.couponInput.defaultValue = localStorage.getItem("appliedCoupon");
				const { user } = this.props;
				const token = user.success ? this.props.user.data.auth_token : null;
				this.props
					.applyCoupon(
						token,
						localStorage.getItem("appliedCoupon"),
						this.props.restaurant_info.id,
						this.props.subtotal
					)
					.then((res) => {
						if (res) {
							if (res[0].payload.message === undefined) {
								this.setState({ couponFailed: false });
							}
						}
					});
			});
		}
	}
	componentWillReceiveProps(nextProps) {
		const { coupon } = this.props;
		//check if props changed after calling the server
		if (coupon !== nextProps.coupon) {
			//if nextProps.coupon is successful then
			if (nextProps.coupon.success) {
				console.log("SUCCESS COUPON");
				localStorage.setItem("appliedCoupon", nextProps.coupon.code);
				this.setState({ couponFailed: false, couponErrorMessage: "" });
			} else {
				console.log("COUPON Removed");
				// coupon is invalid
				console.log("FAILED COUPON");
				localStorage.removeItem("appliedCoupon");
				this.setState({
					couponFailed: !nextProps.coupon,
					couponFailedType: nextProps.coupon.type,
					couponErrorMessage: nextProps.coupon.message,
				});
			}
		}
	}
	handleInput = (event) => {
		this.setState({ inputCoupon: event.target.value });
	};

	handleSubmit = (event) => {
		event.preventDefault();
		const { user } = this.props;
		const token = user.success ? this.props.user.data.auth_token : null;
		this.props
			.applyCoupon(token, this.state.inputCoupon, this.props.restaurant_info.id, this.props.subtotal)
			.then((res) => {
				if (res) {
					if (res[0] === undefined || res[0].payload === undefined || res[0].payload.message === undefined) {
						this.setState({ couponFailed: false });
					}
				}
			});
	};

	render() {
		const { coupon, user, coupon_error } = this.props;
		const { couponFailed, couponErrorMessage } = this.state;

		return (
			<React.Fragment>
				<div className="input-group mb-20">
					<form className="coupon-form" onSubmit={this.handleSubmit}>
						<div className="input-group">
							<div className="input-group-prepend">
								<button className="btn apply-coupon-btn">
									<i className="si si-tag" />
								</button>
							</div>
							<input
								type="text"
								className="form-control apply-coupon-input"
								placeholder={localStorage.getItem("cartCouponText")}
								onChange={this.handleInput}
								style={{ color: localStorage.getItem("storeColor") }}
								spellCheck="false"
								ref="couponInput"
							/>
							<div className="input-group-append">
								<button type="submit" className="btn apply-coupon-btn" onClick={this.handleSubmit}>
									<i className="si si-arrow-right" />
									<Ink duration="500" />
								</button>
							</div>
						</div>
					</form>
					<div className="coupon-status">
						{coupon.code && (
							<div className="coupon-success pt-10 pb-10">
								{localStorage.getItem("showCouponDescriptionOnSuccess") === "true" ? (
									<React.Fragment>{coupon.description}</React.Fragment>
								) : (
									<React.Fragment>
										{'"' + coupon.code + '"'} {localStorage.getItem("cartApplyCoupon")}{" "}
										{coupon.discount_type === "PERCENTAGE" ? (
											coupon.discount + "%"
										) : (
											<React.Fragment>
												{localStorage.getItem("currencySymbolAlign") === "left" &&
													localStorage.getItem("currencyFormat") + coupon.discount}
												{localStorage.getItem("currencySymbolAlign") === "right" &&
													coupon.discount + localStorage.getItem("currencyFormat")}{" "}
												{localStorage.getItem("cartCouponOffText")}
											</React.Fragment>
										)}
									</React.Fragment>
								)}
							</div>
						)}
						{/* Coupon is not applied, then coupon state is true */}
						{couponFailed && <div className="coupon-fail pt-10 pb-10">{couponErrorMessage}</div>}

						{!couponFailed && couponErrorMessage !== "" && !coupon.hideMessage && (
							<React.Fragment>
								{user.success && (
									<div className="coupon-fail pt-10 pb-10">
										{localStorage.getItem("cartInvalidCoupon")}
									</div>
								)}
							</React.Fragment>
						)}

						{coupon_error === "NOTLOGGEDIN" && !user.success && (
							<div className="coupon-fail pt-10 pb-10">{localStorage.getItem("couponNotLoggedin")}</div>
						)}
					</div>
				</div>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
	user: state.user.user,
	coupon: state.coupon.coupon,
	restaurant_info: state.items.restaurant_info,
	coupon_error: state.coupon.coupon_error,
});

export default connect(
	mapStateToProps,
	{ applyCoupon }
)(Coupon);
