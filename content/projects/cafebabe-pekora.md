---
title: Anime Shading Model
type: work
label: Rendering
categories: [shaders]
tags: [UE5, Engine Customization, Rendering, Shader]
summary: A UE5 shading model that reacts to ambient light while keeping an unlit, anime look.
description: "#UE5 #Engine Customization #Rendering #Shader"
thumbnail: /assets/images/pekora/faceshadow-poster.jpg
preview: /assets/videos/pekora/faceshadow-teaser.mp4
order: 1

hero: /assets/videos/pekora/multicolor-demo.mp4
hero_poster: /assets/images/pekora/faceshadow-poster.jpg
hero_caption: The character skin reacts to the light when the color is changed.
facts:
  Tools: UE5, engine customization
what_i_did: |
  I made a shading model for Unreal Engine 5 which reacts to ambient light while maintaining an unlit shader-like appearance.
---

![The shading model also works for multiple and different kinds of light sources.](/assets/videos/pekora/multisource-demo.mp4)

Addtionally, I also made a shadow falloff control option for the shading model, so that artists can control the shadow falloff in certain areas

![For example in Anime faces, it is important to control the face shadow falloff in a special way ignoring the traditional shadow calculation method.](/assets/videos/pekora/faceshadow-demo.mp4)

![Artists can also use a color curve to control the sharpness and area of the shadow.](/assets/videos/pekora/shadowfalloff.mp4)

![Moreover, artist can also decide the tint of the shadow.](/assets/videos/pekora/shadowtint.mp4)

See custom shading model in Unreal Engine [here](https://github.com/donkey0319/UnrealEngine/tree/Anime_Rendering).
