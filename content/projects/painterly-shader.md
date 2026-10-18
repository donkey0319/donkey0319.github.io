---
title: Painterly Shader
type: work
label: Shaders
categories: [shaders]
tags: [UE5, Shader, Substance Painter, Substance Designer]
summary: Post-processing, custom normal maps and painterly textures for a painted look.
description: "#UE5 #Postprocessing #Shader #Substance Painter #Substance Designer"
thumbnail: /assets/images/painterly/painterly.png
order: 2

hero: /assets/images/painterly/painterly.png
facts:
  Tools: UE5, Substance Painter, Substance Designer
what_i_did: |
  This visual effect is implemented through postprocessing, custom normal maps, and painterly-like textures.
---

### Postprocessing
This is implemented through a anisotrophic kuwahara filter, which perfectly remains that edge while lower the color variation.

![Adjustable kernel size of the kuwahara filter](/assets/videos/painterly/painterly.mp4)

### Custom Normal Map
I also created a hand-painted normal map on certain objects such that light doesn’t reflect based on the hardsurface normal.

![Painterly screenshot 2](/assets/images/painterly/painterly3.png)

### Painterly-like Textures
A great technique of adding more details to the scene is to add noise (color variations) to some objects.

![Painterly screenshot 1](/assets/images/painterly/painterly2.png)
*The color on the wall is noised.*
