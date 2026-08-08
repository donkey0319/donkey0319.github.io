---
title: "Painterly Shader"
excerpt: "#UE5 #Postprocessing #Shader #Substance Painter #Substance Designer"
header:
  teaser: /assets/images/painterly/painterly.png
---

This visual effect is implemented through postprocessing, custom normal maps, and painterly-like textures.

### Postprocessing
This is implemented through a anisotrophic kuwahara filter, which perfectly remains that edge while lower the color variation.

<video width="100%" controls>
  <source src="/assets/videos/painterly/painterly.mp4" type="video/mp4">
</video>
<p class="caption">Adjustable kernel size of the kuwahara filter</p>

### Custom Normal Map
I also created a hand-painted normal map on certain objects such that light doesn't reflect based on the hardsurface normal.

<div style="text-align: center;">
  <img src="/assets/images/painterly/painterly3.png" alt="Painterly screenshot 2">
</div>

### Painterly-like Textures
A great technique of adding more details to the scene is to add noise (color variations) to some objects. 

<div style="text-align: center;">
  <img src="/assets/images/painterly/painterly2.png" alt="Painterly screenshot 1">
</div>
<p class="caption">The color on the wall is noised.</p>