package com.schlaf.steam.activities.chrono;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.res.Resources;
import android.graphics.BlurMaskFilter;
import android.graphics.BlurMaskFilter.Blur;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Paint.Align;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.Shader.TileMode;
import android.text.format.DateUtils;
import android.util.AttributeSet;
import android.util.TypedValue;
import android.view.View;

public class CountDownView extends View {

	
	
	
	Paint paint;
	Rect clipbounds = new Rect();
	
	private static final int ARC_WIDTH = 8;
	private static final int HOURS = 1;
	private static final int MINUTES = 2;
	private static final int SECONDS = 3;
	
	private int[] BLUE_RGB = new int[] {73, 206, 255};
	private int[] RED_RGB = new int[] {255, 73, 73};
	
	public static final int RED = 1;
	public static final int BLUE = 2;
	
	/** this clock is running (not paused) */
	private boolean running = true;
	
	private int[] color = BLUE_RGB;
	
	private int hours;
	private int minutes;
	private int seconds;
	
	float arcWidthPixel; // basic arc width converting in exact pixel (not dp)
	
	int screenSize;
	int padding;
	
	int w ;
	int h ;

	int wOrigin;
	int hOrigin;
	
	private StringBuilder sBuilder = new StringBuilder(15);
	
	public CountDownView(Context context) {
		super(context);
	}
	
	public CountDownView(Context context, AttributeSet attributes) {
		super(context, attributes);
		setFocusable(true);
		if (isInEditMode()) {
			hours = 1;
			minutes = 15;
			seconds = 30;
			color = RED_RGB;
		} else {
		}
		
		paint = new Paint();
	}

	public void setColor(int colorChoice) {
		if (colorChoice == RED) {
			color = RED_RGB;
		} else {
			color = BLUE_RGB;
		}
	}
	
	@SuppressLint("DrawAllocation")
	@Override
	public void onDraw(Canvas canvas) {

		Resources r = getResources();
		arcWidthPixel = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, ARC_WIDTH, r.getDisplayMetrics());
		
		w = getWidth();
		h = getHeight();
		screenSize = Math.min(w, h);
		
		padding = screenSize/20;
		
		wOrigin = (w - screenSize) / 2;
		hOrigin = (h - screenSize) / 2;

		// make the entire canvas white
		clipbounds.set(wOrigin, hOrigin, wOrigin+screenSize, hOrigin + screenSize);
		
		drawMarks(canvas);
		drawArc(canvas, hours, HOURS);
		drawArc(canvas, minutes, MINUTES);
		drawArc(canvas, seconds, SECONDS);
		
		drawInnerCircle(canvas);
		
		drawTime(canvas);
		
		
	}
	
	private void drawMarks(Canvas canvas) {

		paint.setStyle(Paint.Style.FILL);
		paint.setColor(Color.WHITE);
		paint.setShader(null);

		int border = padding + (int) arcWidthPixel - 2 ;
		
		RectF oval = new RectF(wOrigin + border, hOrigin + border, w-border - wOrigin, h-border-hOrigin);
		for (int i = 0; i < 12; i++) {
			canvas.drawArc(oval, i*(360/12)-0.75f, 1.5f, true, paint);	
		}
		
		paint.setColor(Color.BLACK);
		paint.setShader(null);
		canvas.drawCircle(w/2, h/2, screenSize/2 - border - (3 * arcWidthPixel), paint);
	}

	
	private void drawArc(Canvas canvas, int time, int what) {

		paint.setStyle(Paint.Style.FILL);
		paint.setColor(Color.argb(255/what, 73, 206, 255));
		
		if (what == SECONDS && running) {
			paint.setShader(null);
			paint.setColor(Color.WHITE);
		} else {
			paint.setShader(new LinearGradient(w/2 , 0, w/2, h , Color.argb(255, color[0], color[1], color[2]) , Color.argb(255 - 10* what, color[0], color[1], color[2]), TileMode.CLAMP));	
		}
		

		int border = padding + (int) (what * arcWidthPixel);
		
		RectF oval = new RectF(wOrigin + border, hOrigin + border, w-border - wOrigin, h-border-hOrigin);
		int arc = 0;
		if (what == HOURS) {
			arc = time * 30; // 12h --> 360°
		} else {
			arc = time * 6 ; // 60 min --> 360°
		}
		canvas.drawArc(oval, -90, arc, true, paint);

		paint.setColor(Color.BLACK);
		paint.setShader(null);
		canvas.drawCircle(w/2, h/2, screenSize/2 - border - arcWidthPixel , paint);

	}
	
	private void drawInnerCircle(Canvas canvas) {
		paint.setColor(Color.BLACK);
		paint.setShader(null);
		canvas.drawCircle(w/2, h/2, screenSize/2 - padding - 4 * arcWidthPixel , paint);
		if (running) {
			paint.setShader(new LinearGradient(w/2 , 0, w/2, h, Color.argb(25, 0, 0, 0), Color.argb(120, color[0], color[1], color[2]), TileMode.REPEAT));
			canvas.drawCircle(w/2, h/2, screenSize/2 - padding - 4 * arcWidthPixel , paint);
		} else {
//			paint.setShader(new LinearGradient(w/2 , 0, w/2, h, Color.argb(25, 0, 0, 0), Color.argb(120, 255, 255, 255), TileMode.REPEAT));
//			canvas.drawCircle(w/2, h/2, screenSize/2 - padding - 4 * arcWidthPixel , paint);
		}
		

	}

	private void drawTime(Canvas canvas) {

		paint.setShader(null);
		paint.setTextAlign(Align.CENTER);
		paint.setTextSize((float) padding * 3f);
		String result = DateUtils.formatElapsedTime(sBuilder, seconds + minutes * 60 + hours * 60 *60 );
		
		if (running) {
			paint.setColor(Color.WHITE);
			canvas.drawText(result, w/2, h/2 + padding * 1.2f, paint);
			
			// paint.setColor(Color.DKGRAY);
			BlurMaskFilter filter = new BlurMaskFilter(5, Blur.OUTER);
			paint.setMaskFilter(filter);
			canvas.drawText(result, w/2, h/2 + padding * 1.2f, paint);
			
		} else {
			paint.setColor(Color.DKGRAY);
			canvas.drawText(result, w/2, h/2 + padding * 1.2f, paint);
		}
		
		
		paint.setMaskFilter(null);
	}

	public void updateTime(long timeMillis, boolean running) {
		this.running = running;
		
		long time1Secondes = timeMillis / 1000;
		hours = (int) time1Secondes/60/60;
		minutes = (int) (time1Secondes-hours*60*60)/60 ;
		seconds = (int) (time1Secondes - hours*60*60 - minutes*60);

		invalidate();
	}


	
}

