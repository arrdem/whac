package com.schlaf.steam.activities.damages;

import java.util.HashMap;
import java.util.List;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Paint.Align;
import android.graphics.Rect;
import android.util.AttributeSet;
import android.view.SurfaceHolder;

import com.schlaf.steam.data.DamageGrid;
import com.schlaf.steam.data.WarjackDamageGrid;
import com.schlaf.steam.data.WarmachineDamageSystemsEnum;

public class JackBeastDamageLineView extends DamageBaseView implements
		SurfaceHolder.Callback {

	DamageGrid damages;// new ModelDamageLine(18,9);

	public JackBeastDamageLineView(Context context, AttributeSet attributes) {
		super(context, attributes);
		init(context);
	}

	public JackBeastDamageLineView(Context context) {
		super(context);
		init(context);
	}
	
	private void init(Context context) {
		//getHolder().addCallback(this);
		//lineThread = new DamageViewThread(getHolder(), this);
		setFocusable(true);
		if (isInEditMode()) {
			damages = new WarjackDamageGrid(null);
			damages.fromString("x....x.............L..R.LLMCRRxMMCCx");
			// damages.applyRealDamages(3, 8);
		} else {
//			setZOrderOnTop(true);    // necessary
//			getHolder().setFormat(PixelFormat.TRANSPARENT);
		}

	}

	@Override
	public void surfaceChanged(SurfaceHolder holder, int format, int width,
			int height) {
		// TODO Auto-generated method stub

	}

	@Override
	public void surfaceCreated(SurfaceHolder holder) {

	}

	@Override
	public void surfaceDestroyed(SurfaceHolder holder) {

		boolean retry = true;
		while (retry) {
			try {
				retry = false;
			} catch (Exception e) {
				System.out.println("Exception Occured" + e.getMessage());
			}
		}
	}

	@Override
	public void onDraw(Canvas canvas) {

		int w = getWidth();
		int h = getHeight();
		
		System.out.println("canvas w = " + w + " - h = " + h);

		Paint paint = new Paint();
		paint.setStyle(Paint.Style.FILL);


		int padding = 3;

		int usableWidth = w - (padding * 2);
		
		paint.setAntiAlias(true);

		int yAxis = (int) ( h / 10 ) ;
		
		int countSystemsOrAspects = 0;
		HashMap<String, DamageStatus> systemStatuses = new HashMap<String, DamageStatus>();
		
		DamageStatus status;
		if (damages instanceof WarjackDamageGrid) {
			WarjackDamageGrid grid = (WarjackDamageGrid) damages;
			status = grid.getDamageStatus();
			List<WarmachineDamageSystemsEnum> systems = grid.getSystems();
			countSystemsOrAspects = systems.size();
			
			for (WarmachineDamageSystemsEnum system : systems) {
				systemStatuses.put(system.getCode(), grid.getNbHitPointsSystem(system));
			}
			
		} else {
			status = new DamageStatus(32, 10, "test");
		}

		// int modelsCount = Math.max(damageLines.size(), 8);
		

		int lifeBarHeight = h * 1 / 4 ;
		
		// draw general status
		Rect clipboundsGreen = new Rect(padding , yAxis , w-padding , yAxis
				+ lifeBarHeight);

		paint.setColor(Color.GREEN);
		canvas.drawRect(clipboundsGreen, paint);
		
		int redZoneWidth = usableWidth * status.getDamagedPoints() / status.getHitPoints();

		
		Rect clipboundsRed = new Rect(padding + usableWidth - redZoneWidth , yAxis , w-padding , yAxis
				+ lifeBarHeight);
		
		paint.setColor(Color.RED);
		canvas.drawRect(clipboundsRed, paint);
		
		// draw system/aspects status
		
		
		int systemNum = 0;
		
		int systemBarWidth = (usableWidth -  ((countSystemsOrAspects -1)  * padding)) / countSystemsOrAspects ;
		yAxis = h * 1/2;
		lifeBarHeight = h * 1 / 3;

		
		for (DamageStatus damageStatus : systemStatuses.values()) {

			int xAxis = padding +  systemBarWidth * systemNum + systemNum * padding;

			clipboundsGreen = new Rect(xAxis, yAxis, xAxis + systemBarWidth, yAxis
					+ lifeBarHeight);

			clipboundsRed = new Rect(xAxis + (int) (systemBarWidth * (1 - damageStatus.percentageDead())) , yAxis, xAxis + systemBarWidth, yAxis
					+ lifeBarHeight);

			paint.setColor(Color.GREEN);
			canvas.drawRect(clipboundsGreen, paint);
			paint.setColor(Color.RED);
			canvas.drawRect(clipboundsRed, paint);
			
			paint.setColor(Color.WHITE);
			paint.setTextAlign(Align.CENTER);
			// paint.setT
			canvas.drawText(damageStatus.getLabel(), xAxis + systemBarWidth / 2 , yAxis + (int) (0.8 * lifeBarHeight), paint);
			
			
//			if (modelDamage.percentageDead() < 0.5f) {
//				smallCoeurImage.setBounds(clipbounds);
//				smallCoeurImage.draw(canvas);
//			} else if (0.5f <= modelDamage.percentageDead() &&  modelDamage.percentageDead() <= 0.99f ){
//				smallCoeurHalfImage.setBounds(clipbounds);
//				smallCoeurHalfImage.draw(canvas);
//			} else {
//				deadImage.setBounds(clipbounds);
//				deadImage.draw(canvas);
//			}
			
			systemNum ++;
		}		

			
	}

	public DamageGrid getDamages() {
		return damages;
	}

	public void setDamages(DamageGrid damages) {
		this.damages = damages;
		damages.registerObserver(this);
	}

	@Override
	public void onChangeDamageStatus(DamageGrid grid) {
		//statusChanged = true;
		invalidate();
	}

}
