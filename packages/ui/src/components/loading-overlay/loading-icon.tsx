import {memo} from 'react';

type SvgProps = React.ComponentPropsWithoutRef<'svg'>;

export const LoadingIcon = memo(({className, ...props}: SvgProps) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <style>{`.spinner_z9k8{transform-origin:center;animation:spinner_StKS 10s infinite
      linear}@keyframes spinner_StKS{100%{transform:rotate(360deg)}}`}</style>
      <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25" />
      <path
        d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
        className="spinner_z9k8"
      />
    </svg>
  );

  // return  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  //   <path
  //     d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48
  // 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75
  // 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0
  // 437 369.1 48 48 0 1 0 369.1 437z" />
  // </svg>

  // return <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  //   <style>.spinner_ajPY{transform-origin:center;animation:spinner_AtaB 10s infinite
  //     linear}@keyframes spinner_AtaB{100%{transform:rotate(360deg)}}</style>
  //   <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
  //     opacity=".25" />
  //   <path
  // d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
  //     class="spinner_ajPY" />
  // </svg>
});

LoadingIcon.displayName = 'LoadingIcon';
