/**
 * Copyright 2016 Reza (github.com/rghorbani)
 *
 * @flow
 */

'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const _ = require('lodash');
const { Animated, StyleSheet, ViewPropTypes } = require('react-native');

const TabBarItem = require('./TabBarItem');
const View = require('../view');
const { BaseComponent } = require('../../commons');
const { Colors } = require('../../style');

/**
 * @description: Basic TabBar component
 * @gif: https://media.giphy.com/media/3o751YHFZVlv3Ay4k8/giphy.gif
 */
class TabBar extends BaseComponent {
  static displayName = 'TabBar';

  static propTypes = {
    ...ViewPropTypes.height,
    /**
     * current selected tab index
     */
    selectedIndex: PropTypes.number,
    /**
     * custom style for the tab bar
     */
    style: ViewPropTypes.style,
    /**
     * custom style for the selected indicator
     */
    indicatorStyle: ViewPropTypes.style,
    /**
     * disable the animated transition of the tab indicator
     */
    disableAnimatedTransition: PropTypes.bool,
    /**
     * callback for when index has change
     */
    onChangeIndex: PropTypes.func,
  };

  static defaultProps = {
    selectedIndex: 0,
    height: 51,
  };

  constructor(props) {
    super(props);
    const childrenCount = React.Children.count(this.props.children);
    this.state = {
      selectedIndex: props.selectedIndex,
      selectedIndicatorPosition: new Animated.Value(this.calcPosition(props.selectedIndex, childrenCount)),
    };
  }

  generateStyles() {
    this.styles = createStyles(this.props);
  }

  calcPosition(index, tabsCount) {
    const position = index * (100 / tabsCount);
    return position;
  }

  calcIndicatorWidth() {
    const childrenCount = React.Children.count(this.props.children);
    if (childrenCount === 0) {
      return '0%';
    }
    const width = Math.floor(100 / childrenCount);
    return `${width}%`;
  }

  onSelectingTab(index) {
    const {disableAnimatedTransition} = this.props;
    const {selectedIndicatorPosition} = this.state;

    const newPosition = this.calcPosition(index, this.props.children.length);

    if (disableAnimatedTransition) {
      selectedIndicatorPosition.setValue(newPosition);
    } else {
      Animated.spring(selectedIndicatorPosition, {
        toValue: this.calcPosition(index, this.props.children.length),
        tension: 30,
        friction: 8,
      }).start();
    }

    this.setState({
      selectedIndex: index,
    });

    _.invoke(this.props, 'onChangeIndex', index);
  }

  renderChildren() {
    const {selectedIndex} = this.state;
    const children = React.Children.map(this.props.children, (child, index) => {
      return React.cloneElement(child, {
        selected: selectedIndex === index,
        onPress: () => {
          this.onSelectingTab(index);
          _.invoke(child.props, 'onPress');
        },
      });
    });

    return children;
  }

  renderSelectedIndicator() {
    const {indicatorStyle} = this.props;
    const {selectedIndicatorPosition} = this.state;
    const width = this.calcIndicatorWidth();
    const left = selectedIndicatorPosition.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    });
    return (
      <Animated.View
        style={[this.styles.selectedIndicator, this.styles.absoluteContainer, {left, width}, indicatorStyle]}
      />
    );
  }

  render() {
    const {height, style} = this.props;
    return (
      <View style={[this.styles.container, style]} bg-white row height={height} useSafeArea>
        {this.renderChildren()}
        {this.renderSelectedIndicator()}
      </View>
    );
  }
}

function createStyles() {
  return StyleSheet.create({
    container: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.dark70,
    },
    selectedIndicator: {
      borderBottomWidth: 1.5,
      borderColor: Colors.blue30,
    },
    absoluteContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
    },
  });
}

TabBar.Item = TabBarItem;

module.exports = TabBar;
