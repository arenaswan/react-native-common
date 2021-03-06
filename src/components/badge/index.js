/**
 * Copyright 2016 Reza (github.com/rghorbani)
 *
 * @flow
 */

'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { Text, StyleSheet } = require('react-native');
import * as Animatable from 'react-native-animatable';

const { BaseComponent } = require('../../commons');
const { BorderRadiuses, Colors, Typography, ThemeManager } = require('../../style');

class Badge extends BaseComponent {
  static displayName = 'Badge';

  static propTypes = {
    /**
     * Text to show inside the badge
     */
    label: PropTypes.string,
    /**
     * Color of the badge background
     */
    backgroundColor: PropTypes.string,
    /**
     * the badge size (default, small)
     */
    size: PropTypes.oneOf(['default', 'small']),
    /**
     * Additional styles for the top container
     */
    containerStyle: PropTypes.object,
    /**
     * Use to identify the badge in tests
     */
    testId: PropTypes.string,
  };

  static defaultProps = {
    size: 'default',
  };

  generateStyles() {
    this.styles = createStyles(this.props);
  }

  getBadgeWidthStyle({label, size}) {
    const isOneLetter = label.length < 2;
    const isSmallBadge = size === 'small';
    const width = isSmallBadge ? (isOneLetter ? 18 : 25) : (isOneLetter ? 21 : 30);
    return {width};
  }

  render() {
    const { size } = this.props;
    const containerStyle = this.extractContainerStyle(this.props);
    const backgroundStyle = this.props.backgroundColor && {backgroundColor: this.props.backgroundColor};
    const animationProps = this.extractAnimationProps();
    const isSmallBadge = size === 'small';
    const width = this.getBadgeWidthStyle(this.props);

    return (
      <Animatable.View
        testID={this.props.testId}
        style={[
          width,
          this.styles.badge,
          isSmallBadge && this.styles.badgeSmall,
          containerStyle,
          backgroundStyle,
        ]}
        {...animationProps}
      >
        <Text
          style={[this.styles.label, isSmallBadge && this.styles.labelSmall]}
          allowFontScaling={false}
          numberOfLines={1}
          testID="badge"
        >
          {this.props.label}
        </Text>
      </Animatable.View>
    );
  }
}

function createStyles() {
  return StyleSheet.create({
    badge: {
      height: 21,
      borderRadius: BorderRadiuses.br100,
      backgroundColor: ThemeManager.primaryColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeSmall: {
      height: 18,
    },
    label: {
      ...Typography.text90,
      color: Colors.white,
      backgroundColor: 'transparent',
    },
    labelSmall: {
      ...Typography.text100,
      lineHeight: undefined,
    },
  });
}

module.exports = Badge;
