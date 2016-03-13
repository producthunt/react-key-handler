/* @flow */

import React from 'react';
import keyNames from 'keycodes';
import {canUseDOM} from 'exenv';

import {KEYUP} from '../constants';
import {isInput, keyValues, matchesKeyboardEvent} from '../utils';

/**
 * Types.
 */

type Props = {
  keyValue: ?string,
  keyCode: ?number,
  keyEventName: string,
  keyName: ?string,
  onKeyHandle: Function,
};

/**
 * KeyHandler component.
 */

export default class KeyHandler extends React.Component {
  props: Props;

  static defaultProps = {
    keyEventName: KEYUP,
  };

  shouldComponentUpdate(): boolean {
    return false;
  }

  constructor(props: Props) {
    super(props);

    this.handleKey = this.handleKey.bind(this);
  }

  componentDidMount(): void {
    if (!canUseDOM) return;

    window.document.addEventListener(this.props.keyEventName, this.handleKey);
  }

  componentWillUnmount(): void {
    if (!canUseDOM) return;

    window.document.removeEventListener(this.props.keyEventName, this.handleKey);
  }

  render(): null {
    return null;
  }

  handleKey(event: KeyboardEvent): void {
    if (!matchesKeyboardEvent(event, this.props)) {
      return;
    }

    const {target} = event;

    if (target instanceof window.HTMLElement) {
      if (isInput(target)) {
        return;
      }
    }

    this.props.onKeyHandle(event);
  }
}

/**
 * Types.
 */

type DecoratorProps = {
  keyValue: ?string,
  keyCode: ?number,
  keyName: ?string,
  keyEventName: ?string,
}

type State = {
  keyValue: ?string,
  keyCode: ?number,
  keyName: ?string,
};

/**
 * KeyHandler decorators.
 */

export function keyHandler({keyValue, keyCode, keyName, keyEventName}: DecoratorProps): Function {
  return (component) => {
    return class KeyHandleDecorator extends React.Component {
      state: State = { keyValue: null, keyCode: null, keyName: null };

      constructor(props: any) {
        super(props);

        this.handleKey = this.handleKey.bind(this);
      }

      render(): ReactElement {
        return (
          <div>
            <KeyHandler keyValue={keyValue} keyCode={keyCode} keyEventName={keyEventName} keyName={keyName} onKeyHandle={this.handleKey} />

            {this.renderDecoratedComponent()}
          </div>
        );
      }

      renderDecoratedComponent(): ReactElement {
        const {keyValue, keyCode, keyName} = this.state;

        return React.createElement(component, { ...this.props, keyValue, keyCode, keyName });
      }

      handleKey(event: KeyboardEvent): void {
        this.setState({ keyValue: event.key || keyValues(keyNames(event.keyCode)), keyCode: event.keyCode, keyName: keyNames(event.keyCode) });
      }
    };
  };
}

export function keyToggleHandler({keyValue, keyCode, keyName, keyEventName}: DecoratorProps): Function {
  return (component) => {
    return class KeyHandleDecorator extends React.Component {
      state: State = { keyValue: null, keyCode: null, keyName: null };

      constructor(props: any) {
        super(props);

        this.handleToggleKey = this.handleToggleKey.bind(this);
      }

      render(): ReactElement {
        return (
          <div>
            <KeyHandler keyValue={keyValue} keyCode={keyCode} keyEventName={keyEventName} keyName={keyName} onKeyHandle={this.handleToggleKey} />

            {this.renderDecoratedComponent()}
          </div>
        );
      }

      renderDecoratedComponent(): ReactElement {
        const {keyValue, keyCode, keyName} = this.state;

        return React.createElement(component, { ...this.props, keyValue, keyCode, keyName });
      }

      handleToggleKey(event: KeyboardEvent): void {
        if (!matchesKeyboardEvent(event, this.state)) {
          this.setState({ keyValue: null, keyCode: null, keyName: null });
          return;
        }

        this.setState({ keyValue: event.key || keyValues(keyNames(event.keyCode)), keyCode: event.keyCode, keyName: keyNames(event.keyCode) });
      }
    };
  };
}

export * from '../constants';