import { Box, Fade, Grow, Slide } from "@mui/material";
import React from "react";
import { matchPath, useLocation } from "react-router-dom";
import { PathParams, TRoute } from "../types/global";
import { validateParams } from "../utils/router";

interface UseMatchedRouteOptions {
  notFoundComponent?: React.FC;
  matchOnSubPath?: boolean;
  transition?:
    | "none"
    | "fade"
    | "grow"
    | "slide-up"
    | "slide-down"
    | "slide-left"
    | "slide-right";
}

interface TransitionProps {
  in: boolean;
  children: React.ReactNode;
}

const useMatchedRoute = (
  routes: ReadonlyArray<TRoute>,
  fallbackComponent?: React.FC,
  options?: UseMatchedRouteOptions
): {
  route: TRoute | undefined;
  params: PathParams | null;
  MatchedElement: React.JSX.Element;
} => {
  const {
    notFoundComponent,
    matchOnSubPath,
    transition = "fade"
  } = options || {};
  const location = useLocation();

  const results = routes
    .map((route: TRoute) => ({
      route,
      match: matchPath(
        { path: route.path, end: !matchOnSubPath, caseSensitive: true },
        location.pathname
      )
    }))
    .filter(({ match }) => !!match);

  const [firstResult] = results;
  const { match, route } = firstResult || {};

  const Fallback = fallbackComponent;
  const NotFound = notFoundComponent || (() => <>not found</>);

  const Transition: React.FC<TransitionProps> = React.useMemo(() => {
    if (transition === "fade") {
      const FadeTransition: React.FC<TransitionProps> = ({
        children,
        in: inProp
      }) => (
        <Fade in={inProp} timeout={300} unmountOnExit>
          <Box sx={{ height: "100%" }}>{children}</Box>
        </Fade>
      );
      return FadeTransition;
    }
    if (transition === "grow") {
      const GrowTransition: React.FC<TransitionProps> = ({
        children,
        in: inProp
      }) => (
        <Grow in={inProp} timeout={300} unmountOnExit>
          <Box sx={{ height: "100%" }}>{children}</Box>
        </Grow>
      );
      return GrowTransition;
    }
    if (transition.startsWith("slide")) {
      const [, direction] = transition.split("-");
      const SlideTransition: React.FC<TransitionProps> = ({
        children,
        in: inProp
      }) => (
        <Slide
          in={inProp}
          direction={direction as "left" | "right" | "up" | "down"}
          timeout={300}
          unmountOnExit
        >
          <Box sx={{ height: "100%" }}>{children}</Box>
        </Slide>
      );
      return SlideTransition;
    }
    return (({ children }) => <>{children}</>) as React.FC<TransitionProps>;
  }, [transition]);

  const matchedPaths = new Set(results.map(({ route: r }) => r.path));

  return {
    route,
    params:
      match && route && validateParams(route.path, match.params)
        ? (match.params as PathParams)
        : {},
    MatchedElement: (
      <>
        {routes.map(({ path, Component: RouteComponent }) => (
          <Transition key={path} in={matchedPaths.has(path)}>
            <RouteComponent />
          </Transition>
        ))}
        <Transition in={results.length === 0}>
          {Fallback ? <Fallback /> : <NotFound />}
        </Transition>
      </>
    )
  };
};

export default useMatchedRoute;
