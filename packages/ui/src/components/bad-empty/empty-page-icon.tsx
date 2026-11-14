import {memo, useId} from 'react';

type SvgProps = React.ComponentPropsWithoutRef<'svg'>;

export const EmptyPageIcon = memo(({className, ...props}: SvgProps) => {
  const gradientId = useId();
  return (
    <svg
      width="75px"
      height="80px"
      viewBox="0 0 75 80"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className={className}
      {...props}
    >
      <title>empty_page</title>
      <defs>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="150.139634%" id={`${gradientId}-1`}>
          <stop stopColor="#6B7485" offset="0%"></stop>
          <stop stopColor="#F9FAFD" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id={`${gradientId}-2`}>
          <stop stopColor="#626771" offset="0%"></stop>
          <stop stopColor="#6B7485" offset="100%"></stop>
        </linearGradient>
      </defs>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g transform="translate(-610.000000, -280.000000)">
          <g transform="translate(610.000000, 264.000000)">
            <g transform="translate(0.000000, 20.718653)">
              <polygon
                fill="#99A3B4"
                opacity="0.452284702"
                points="62.5619972 46.7327569 73.8632393 46.7322316 62.5619972 29.4168594"
              ></polygon>
              <polygon
                fill="#99A3B4"
                opacity="0.452284702"
                points="0 46.7327569 11.3145848 46.7327569 11.3145848 33.0939734 11.3145848 29.4168594"
              ></polygon>
              <g>
                <path
                  d="M58.4205162,63.5053345 L15.4560658,63.5053345 C13.1689009,63.5053345 11.3145848,61.6510185 11.3145848,59.3638536 L11.3145848,4.14148096 C11.3145848,1.85431606 13.1689009,0 15.4560658,0 L58.4205162,0 C60.7076811,0 62.5619972,1.85431606 62.5619972,4.14148096 L62.5619972,59.3638536 C62.5619972,61.6510185 60.7076811,63.5053345 58.4205162,63.5053345"
                  fill={`url(#${gradientId}-1)`}
                ></path>
                <g transform="translate(0.000000, 46.732215)">
                  <path
                    d="M-0.0001050604,0.000646484996 L16.2227966,0.0573791009 C16.2227966,0.0573791009 20.4115547,0.0941502408 22.21229,5.93655907 C22.21229,5.93655907 22.9471875,7.36958292 25.0783377,7.4425999 C27.2094879,7.51666748 48.7983494,7.69211835 48.7983494,7.69211835 C48.7983494,7.69211835 51.0918179,7.80138117 52.0200266,5.12549278 C52.9482352,2.4501297 53.6584435,-0.0461053929 57.6990665,0.000646484996 L73.8631343,0 L73.8631343,22.9826089 C73.8631343,22.9826089 73.4807144,27.1866008 68.839146,28.0060719 L4.40245099,28.0060719 C4.40245099,28.0060719 0.0755384274,27.2958636 -0.0001050604,22.3816634 L-0.0001050604,0.000646484996 Z"
                    fill="#6B7485"
                  ></path>
                </g>
              </g>
            </g>
            <rect
              fill={`url(#${gradientId}-2)`}
              x="20.4867779"
              y="29.9989357"
              width="33.0940259"
              height="7.87952998"
              rx="1.2"
            ></rect>
            <rect
              fill="#878F9D"
              x="20.4867779"
              y="52.937123"
              width="33.0940259"
              height="2.62650999"
              rx="1.313255"
            ></rect>
            <rect
              fill="#878F9D"
              x="20.4867779"
              y="61.6921563"
              width="19.9614759"
              height="2.62650999"
              rx="1.313255"
            ></rect>
          </g>
        </g>
      </g>
    </svg>
  );
});

EmptyPageIcon.displayName = 'EmptyPageIcon';
