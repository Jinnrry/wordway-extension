import * as React from 'react';
import { Popper } from 'react-popper';
import classNames from 'classnames';
import { LookUpResult } from '@wordway/translate-api';

import InjectTransTooltipContent from './InjectTransTooltipContent';
import InjectTransTooltipIcon from './InjectTransTooltipIcon';

import cls from './InjectTransTooltip.module.scss';

class VirtualReferenceElement {
  boundingClientRect: DOMRect;

  constructor(boundingClientRect: DOMRect) {
    this.boundingClientRect = boundingClientRect;
  }

  getBoundingClientRect() {
    return this.boundingClientRect;
  }

  get clientWidth() {
    return this.getBoundingClientRect().width;
  }

  get clientHeight() {
    return this.getBoundingClientRect().height;
  }
}

interface InjectTransTooltipProps {
  q: string;
  autoload: boolean;
  boundingClientRect: DOMRect;
  onShow: any;
  onHide: any;
}

interface InjectTransTooltipState {
  virtualReferenceElement: VirtualReferenceElement;
  visible: boolean;
  switching: boolean;
  lookUpResult?: LookUpResult;
  lookUpError?: Error;
}

class InjectTransTooltip extends React.Component<
  InjectTransTooltipProps,
  InjectTransTooltipState
> {
  constructor(props: InjectTransTooltipProps, state: InjectTransTooltipState) {
    super(props, state);

    this.state = {
      virtualReferenceElement: new VirtualReferenceElement(
        props.boundingClientRect
      ),
      visible: true,
      switching: false,
    };
  }

  componentDidMount() {
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('scroll', this.onScroll);
  }

  onMouseUp = () => {};

  onMouseDown = (e: any) => {
    const path = e.path || (e.composedPath && e.composedPath());
    if (path.findIndex(({ id }: any) => id === '___wordway') >= 0) return;

    this.handleClose();
  };

  onKeyDown = (e: KeyboardEvent) => {
    if (!e.shiftKey) return;

    this.handleClose();
  }

  onScroll = (e: any) => {
    const selection: any = document.getSelection();
    const selectionRange = selection.getRangeAt(0);
    const boundingClientRect = selectionRange.getBoundingClientRect();

    this.setState({
      virtualReferenceElement: new VirtualReferenceElement(
        boundingClientRect
      ),
    })
  };

  handleClose = () => {
    const { onHide } = this.props;

    this.setState({
      visible: false
    });

    setTimeout(() => onHide(), 200);
  };

  renderTransTooltipIcon = () => {
    const { q, autoload } = this.props;
    const handleLoadComplete = (lookUpResult: any, lookUpError: any) => {
      this.setState({ switching: true });
      setTimeout(() => {
        this.setState({
          switching: false,
          lookUpResult,
          lookUpError
        });
      }, 1);
    };

    return (
      <InjectTransTooltipIcon
        q={q}
        autoload={autoload}
        onLoadComplete={handleLoadComplete}
      />
    );
  };

  renderTransTooltipContent = () => {
    return (
      <>
        <InjectTransTooltipContent
          q={this.props.q}
          lookUpResult={this.state.lookUpResult}
          lookUpError={this.state.lookUpError}
        />
        <button onClick={this.handleClose} className={cls['btn-close']}>
          <span />
        </button>
      </>
    );
  };

  render() {
    const { switching, lookUpResult, lookUpError } = this.state;
    if (switching) return <div />;

    let popperBody = this.renderTransTooltipIcon();
    let popperClassNames = (_: any): any => {};

    if (lookUpResult || lookUpError) {
      popperBody = this.renderTransTooltipContent();
      popperClassNames = (placement: any): any => {
        return {
          [cls['popper-fade-in-up']]:
            (placement || 'bottom').startsWith('top') &&
            this.state.visible,
          [cls['popper-fade-in-down']]:
            (placement || 'bottom').startsWith('bottom') &&
            this.state.visible,
          [cls['popper-fade-out-up']]:
            (placement || 'bottom').startsWith('top') &&
            !this.state.visible,
          [cls['popper-fade-out-down']]:
            (placement || 'bottom').startsWith('bottom') &&
            !this.state.visible
        }
      }
    }

    return (
      <Popper
        referenceElement={this.state.virtualReferenceElement}
      >
        {({ ref, style, placement, arrowProps }) => (
          <div ref={ref} className={cls['trans-tooltip']} style={style}>
            <div
              className={classNames(cls['popper'], {
                ...popperClassNames(placement),
              })}
            >
              <div className={cls['popper-body']}>{popperBody}</div>
              {!(lookUpResult || lookUpError) ? null : (
                <div
                  ref={arrowProps.ref}
                  data-placement={placement}
                  className={cls['popper-arrow']}
                  style={arrowProps.style}
                />
              )}
            </div>
          </div>
        )}
      </Popper>
    );
  }
}

export default InjectTransTooltip;
