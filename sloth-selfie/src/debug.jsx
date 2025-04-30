import React, { useEffect } from 'react';

const useWhyDidYouRender = (name, props) => {
  const prevProps = React.useRef(props);

  useEffect(() => {
    const allKeys = Object.keys({ ...prevProps.current, ...props });
    const changes = allKeys.reduce((acc, key) => {
      if (prevProps.current[key] !== props[key]) {
        acc[key] = {
          from: prevProps.current[key],
          to: props[key]
        };
      }
      return acc;
    }, {});
    if (Object.keys(changes).length > 0) {
      console.log(`[why-did-you-render] ${name}`, changes);
    }
    prevProps.current = props;
  });
};


export default useWhyDidYouRender;
