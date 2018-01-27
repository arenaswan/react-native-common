/**
 * Copyright 2017 Reza (github.com/rghorbani)
 *
 * @flow
 */
'use strict';

const React = require('react');
const {
  PixelRatio,
  StyleSheet,
  View,
} = require('react-native');

class ItemsWithSeparator extends React.Component {
  props: {
    style?: any;
    separatorStyle?: any;
    children?: any;
  };

  render() {
    var children = [];
    var length = React.Children.count(this.props.children);
    React.Children.forEach(
      this.props.children,
      (child, ii) => {
        children.push(child);
        if (ii !== length - 1) {
          children.push(
            <View
              key={'separator-' + ii}
              style={[styles.separator, this.props.separatorStyle]}
            />
          );
        }
      }
    );
    return (
      <View style={this.props.style}>
        {children}
      </View>
    );
  }
}

var styles = StyleSheet.create({
  separator: {
    backgroundColor: '#0322500A',
    height: 1 / PixelRatio.get(),
  },
});

module.exports = ItemsWithSeparator;