precision mediump float;

uniform sampler2D uTexture;

#include "display/_compute-displayed-value.frag"

void main() {
    float value = step(0.2, sampleTexture(uTexture));

    vec3 color = vec3(step(0.2, value));
    gl_FragColor = vec4(color, 1);
}