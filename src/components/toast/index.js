/**
 * Copyright 2016 Reza (github.com/rghorbani)
 *
 * @flow
 */

'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const _ = require('lodash');
const Animatable = require('react-native-animatable');
const { StyleSheet } = require('react-native');
const { BlurView } = require('react-native-blur');

const Button = require('../button');
const View = require('../view');
const Assets = require('../../assets');
const { BaseComponent } = require('../../commons');
const { BorderRadiuses, Colors, ThemeManager, Typography } = require('../../style');

const DURATION = 300;
const DELAY = 100;

/**
 * @description Toast component for showing a feedback about a user action.
 * @extends: Animatable.View
 * @extendslink: https://github.com/oblador/react-native-animatable
 * @gif: https://media.giphy.com/media/3oFzm1pKqGXybiDUre/giphy.gif
 */
class Toast extends BaseComponent {
  static displayName = 'Toast';

  static propTypes = {
    /**
     * Whether to show or hide the toast
     */
    visible: PropTypes.bool,
    /**
     * The position of the toast. top or bottom
     */
    position: PropTypes.oneOf(['relative', 'top', 'bottom']),
    /**
     * The height of the toast
     */
    height: PropTypes.number,
    /**
     * The background color of the toast
     */
    backgroundColor: PropTypes.string,
    /**
     * the toast content color (message, actions labels)
     */
    color: PropTypes.string,
    /**
     * the toast message
     */
    message: PropTypes.string,
    /**
     * a custom style for the toast message
     */
    messageStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
    /**
     * one or two actions for the user to display in the toast
     */
    actions: PropTypes.arrayOf(PropTypes.shape(Button.propTypes)),
    /**
     * callback for dismiss action
     */
    onDismiss: PropTypes.func,
    /**
     * show dismiss action
     */
    allowDismiss: PropTypes.bool,
    /**
     * render a custom toast content (better use with StyleSheet.absoluteFillObject to support safe area)
     */
    renderContent: PropTypes.func,
    /**
     * should message be centered in the toast
     */
    centerMessage: PropTypes.bool,
    /**
     * should the toast appear/disappear with animation
     */
    animated: PropTypes.bool,
    /**
     * enable blur effect for Toast
     */
    enableBlur: PropTypes.bool,
    /**
     * blur option for blur effect according to react-native-blur lib (make sure enableBlur is on)
     */
    blurOptions: PropTypes.object,
    /**
     * custom zIndex for toast
     */
    zIndex: PropTypes.number,
  };

  static defaultProps = {
    position: 'top',
    color: Colors.white,
    animated: true,
    zIndex: 100,
  };

  state = {
    isVisible: false,
    animationConfig: this.getAnimation(true),
    contentAnimation: this.getContentAnimation(true),
    duration: DURATION,
    delay: DELAY,
  };

  constructor(props) {
    super(props);

    const {animated} = this.props;

    if (animated) {
      setupRelativeAnimation(getHeight(this.props));
    }
  }

  componentWillReceiveProps(nextProps) {
    const {visible, animated} = nextProps;
    const {isVisible} = this.state;
    if (visible !== isVisible) {
      if (animated) {
        setupRelativeAnimation(getHeight(nextProps));
      }

      const newState = animated ? {
        animationConfig: this.getAnimation(visible),
        contentAnimation: this.getContentAnimation(visible),
      } : {
        animationConfig: {},
        contentAnimation: {},
      };

      this.setState(newState);
    }
  }

  generateStyles() {
    this.styles = createStyles(this.props);
  }

  getPositionStyle() {
    const {position} = this.props;

    return position === 'relative' ? {position} : getAbsolutePositionStyle(position);
  }

  getAnimation(shouldShow) {
    const {position, useNativeDriver} = this.props;
    const animationDescriptor = getAnimationDescriptor(position, this.state);
    const {animation, duration, delay} = shouldShow ? animationDescriptor.enter : animationDescriptor.exit;

    return {animation, duration, delay, useNativeDriver, onAnimationEnd: () => this.onAnimationEnd()};
  }

  getContentAnimation(shouldShow) {
    const {position} = this.props;
    const {duration, delay} = this.state;

    if (position === 'relative') {
      return {
        animation: shouldShow ? 'fadeIn' : 'fadeOut',
        duration,
        delay: shouldShow ? delay : 0,
        onAnimationEnd: () => this.onAnimationEnd(),
      };
    }
  }

  getBlurOptions() {
    const {blurOptions} = this.getThemeProps();
    return {
      blurType: 'light',
      amount: 5,
      ...blurOptions,
    };
  }

  renderContent() {
    const {actions, allowDismiss, renderContent} = this.getThemeProps();

    if (_.isFunction(renderContent)) {
      return renderContent(this.props);
    }

    const hasOneAction = _.size(actions) === 1;
    const height = getHeight(this.props);

    return (
      <View row height={height} centerV spread>
        {this.renderMessage()}
        {(hasOneAction || allowDismiss) && (
          <View row height="100%">
            {hasOneAction && this.renderOneAction()}
            {this.renderDismissButton()}
          </View>
        )}
      </View>
    );
  }

  renderMessage() {
    const {message, messageStyle, centerMessage, color} = this.props;
    const {contentAnimation} = this.state;
    return (
      <View flex centerH={centerMessage}>
        <Animatable.Text style={[this.styles.message, color && {color}, messageStyle]} {...contentAnimation}>
          {message}
        </Animatable.Text>
      </View>
    );
  }

  renderOneAction() {
    const action = _.first(this.props.actions);
    const {contentAnimation} = this.state;

    if (action) {
      return (
        <Animatable.View {...contentAnimation}>
          <Button style={this.styles.oneActionStyle} size="medium" {...action} />
        </Animatable.View>
      );
    }
  }

  renderTwoActions() {
    const {actions} = this.props;
    const {contentAnimation} = this.state;

    return (
      <Animatable.View style={this.styles.containerWithTwoActions} {...contentAnimation}>
        <Button size="small" {...actions[0]} />
        <Button marginL-12 size="small" {...actions[1]} />
      </Animatable.View>
    );
  }

  renderDismissButton() {
    const {allowDismiss, onDismiss, color} = this.props;
    const {contentAnimation} = this.state;
    if (allowDismiss) {
      return (
        <Animatable.View style={{justifyContent: 'center'}} {...contentAnimation}>
          <Button
            link
            iconStyle={[this.styles.dismissIconStyle, color && {tintColor: color}]}
            iconSource={Assets.icons.x}
            onPress={onDismiss}
          />
        </Animatable.View>
      );
    }
  }

  render() {
    const {backgroundColor, actions, enableBlur, testID, zIndex} = this.getThemeProps();
    const {animationConfig} = this.state;
    const hasOneAction = _.size(actions) === 1;
    const hasTwoActions = _.size(actions) === 2;
    const positionStyle = this.getPositionStyle();
    const height = getHeight(this.props);
    const blurOptions = this.getBlurOptions();

    const shouldShowToast = this.shouldShowToast();
    if (!shouldShowToast) {
      return null;
    }

    return (
      <View style={[positionStyle]} useSafeArea testID={testID}>
        <View height={height} />

        <Animatable.View
          style={[
            this.styles.container,
            backgroundColor && {backgroundColor},
            hasOneAction && this.styles.containerWithOneAction,
            {zIndex},
          ]}
          {...animationConfig}
        >
          {enableBlur && <BlurView style={this.styles.blurView} {...blurOptions} />}

          {this.renderContent()}

          {hasTwoActions && <View>{this.renderTwoActions()}</View>}
        </Animatable.View>
      </View>
    );
  }

  shouldShowToast() {
    const {visible} = this.props;
    const {isVisible} = this.state;
    return isVisible || (visible && !isVisible);
  }

  onAnimationEnd() {
    const {visible} = this.props;
    this.setState({
      isVisible: visible,
    });
  }
}

function createStyles() {
  return StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: Colors.rgba(ThemeManager.primaryColor, 0.8),
      paddingHorizontal: 15,
    },
    containerWithOneAction: {
      paddingRight: 0,
    },
    containerWithTwoActions: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 14,
    },
    message: {
      color: Colors.white,
      ...Typography.text80,
    },
    oneActionStyle: {
      borderRadius: BorderRadiuses.br0,
      minWidth: undefined,
      height: '100%',
      backgroundColor: Colors.rgba(ThemeManager.primaryColor, 0.7),
    },
    dismissIconStyle: {
      width: 12,
      height: 12,
      tintColor: Colors.white,
    },
    blurView: {
      ...StyleSheet.absoluteFillObject,
    },
  });
}

function getAnimationDescriptor(name, {duration = DURATION, delay = DELAY}) {
  const defaultProps = {duration, delay: 0};
  const animationDescriptorMap = {
    top: {
      enter: {...defaultProps, animation: 'slideInDown_toast'},
      exit: {...defaultProps, animation: 'slideOutUp_toast'},
    },
    bottom: {
      enter: {...defaultProps, animation: 'slideInUp_toast'},
      exit: {...defaultProps, animation: 'slideOutDown_toast'},
    },
    relative: {
      enter: {...defaultProps, animation: 'growUp_toast'},
      exit: {...defaultProps, animation: 'growDown_toast', delay},
    },
  };

  return animationDescriptorMap[name] || {};
}

function getAbsolutePositionStyle(location) {
  return {
    position: 'absolute',
    left: 0,
    right: 0,
    [location]: 0,
  };
}

function setupRelativeAnimation(height) {
  Animatable.initializeRegistryWithDefinitions({
    // bottom
    slideInUp_toast: {
      from: {translateY: height},
      to: {translateY: 0},
    },
    slideOutDown_toast: {
      from: {translateY: 0},
      to: {translateY: height},
    },
    // top
    slideInDown_toast: {
      from: {translateY: -height},
      to: {translateY: 0},
    },
    slideOutUp_toast: {
      from: {translateY: 0},
      to: {translateY: -height},
    },
    // relative
    growUp_toast: {
      from: {height: 0},
      to: {height},
    },
    growDown_toast: {
      from: {height},
      to: {height: 0},
    },
  });
}

function getHeight({height, actions}) {
  if (_.isUndefined(height)) {
    return _.size(actions) === 2 ? 92 : 48;
  }
  return height;
}

module.exports = Toast;
