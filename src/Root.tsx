import { Composition } from 'remotion';
import {
  AbstractGradient,
  abstractGradientSchema,
  defaultAbstractGradientProps,
} from './compositions/AbstractGradient/AbstractGradient';
import {
  TypographyKinetic,
  typographyKineticSchema,
  defaultTypographyKineticProps,
} from './compositions/TypographyKinetic/TypographyKinetic';
import {
  GeometricLoop,
  geometricLoopSchema,
  defaultGeometricLoopProps,
} from './compositions/GeometricLoop/GeometricLoop';
import {
  ProductShowcase,
  productShowcaseSchema,
  defaultProductShowcaseProps,
} from './compositions/ProductShowcase/ProductShowcase';
import {
  DataViz,
  dataVizSchema,
  defaultDataVizProps,
} from './compositions/DataViz/DataViz';

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="AbstractGradient"
        component={AbstractGradient}
        durationInFrames={FPS * 8}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        schema={abstractGradientSchema}
        defaultProps={defaultAbstractGradientProps}
      />
      <Composition
        id="TypographyKinetic"
        component={TypographyKinetic}
        durationInFrames={FPS * 6}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        schema={typographyKineticSchema}
        defaultProps={defaultTypographyKineticProps}
      />
      <Composition
        id="GeometricLoop"
        component={GeometricLoop}
        durationInFrames={FPS * 6}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        schema={geometricLoopSchema}
        defaultProps={defaultGeometricLoopProps}
      />
      <Composition
        id="ProductShowcase"
        component={ProductShowcase}
        durationInFrames={FPS * 10}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        schema={productShowcaseSchema}
        defaultProps={defaultProductShowcaseProps}
      />
      <Composition
        id="DataViz"
        component={DataViz}
        durationInFrames={FPS * 12}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        schema={dataVizSchema}
        defaultProps={defaultDataVizProps}
      />
    </>
  );
};
