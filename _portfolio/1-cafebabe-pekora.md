---
title: "Anime Shading Model"
excerpt: "#UE5 #Engine Customization #Rendering #Shader"
header:
  teaser: /assets/images/pekora/cafebabe-pekora-header.jpg
---

I made a shading model for Unreal Engine 5 which reacts to ambient light while maintaining an unlit shader-like appearance.

<video width="100%" controls>
  <source src="/assets/videos/pekora/multicolor-demo.mp4" type="video/mp4">
</video>
<p class="caption">The character skin reacts to the light when the color is changed.</p>


<video width="100%" controls>
  <source src="/assets/videos/pekora/multisource-demo.mp4" type="video/mp4">
</video>
<p class="caption">The shading model also works for multiple and different kinds of light sources.</p>

 Addtionally, I also made a shadow falloff control option for the shading model, so that artists can control the shadow falloff in certain areas

<video width="100%" controls>
  <source src="/assets/videos/pekora/faceshadow-demo.mp4" type="video/mp4">
</video>
<p class="caption">For example in Anime faces, it is important to control the face shadow falloff in a special way ignoring the traditional shadow calculation method.</p>

<video width="100%" controls>
  <source src="/assets/videos/pekora/shadowfalloff.mp4" type="video/mp4">
</video>
<p class="caption">Artists can also use a color curve to control the sharpness and area of the shadow.</p>

<video width="100%" controls>
  <source src="/assets/videos/pekora/shadowtint.mp4" type="video/mp4">
</video>
<p class="caption">Moreover, artist can also decide the tint of the shadow.</p>

See custom shading model in Unreal Engine [here](https://github.com/donkey0319/UnrealEngine/tree/Anime_Rendering).
