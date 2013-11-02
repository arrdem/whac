package com.schlaf.steam.activities.damages;

import java.util.ArrayList;
import java.util.List;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.drawable.Drawable;
import android.util.AttributeSet;
import android.util.Log;
import android.view.MotionEvent;
import android.view.SurfaceHolder;

import com.schlaf.steam.R;
import com.schlaf.steam.data.DamageBox;
import com.schlaf.steam.data.DamageGrid;

public class DamageLineView extends DamageBaseView implements
		SurfaceHolder.Callback {

	private boolean edit;

	ModelDamageLine damageLine;
	
	List<Coords> coords = new ArrayList<DamageLineView.Coords>();;

	private Drawable textureFond;
	
	Paint paint;
	
	/**
	 * association d'une case de dommage à son centre, permet de trouver où l'on
	 * clique
	 * 
	 * @author S0085289
	 * 
	 */
	private class Coords {
		private DamageBox box;
		private int x;
		private int y;

		public Coords(DamageBox box, int x, int y) {
			this.box = box;
			this.x = x;
			this.y = y;
		}

		public int distanceCarreeFrom(int xx, int yy) {
			return ((xx - x) * (xx - x) + (yy - y) * (yy - y));
		}
		

	}

	/**
	 * lorsqu'on touche la vue.
	 */
	@Override
	public boolean onTouchEvent(MotionEvent event) {

		final int action = event.getAction();
		// (1)
		final int evX = (int) event.getX();
		final int evY = (int) event.getY();
		switch (action) {
		case MotionEvent.ACTION_DOWN:
			break;
		case MotionEvent.ACTION_UP:

			if (edit) {
				int distance = 10000000;
				Coords pointProche = null;

				for (Coords coord : coords) {
					int dist = coord.distanceCarreeFrom(evX, evY);
					if (dist < distance) {
						pointProche = coord;
						distance = dist;
					}
				}

				pointProche.box.flipFlop();
				invalidate();
			} else {
//				System.out.println("shake!");
//				Animation shake = AnimationUtils.loadAnimation(getContext(),
//						R.anim.shake);
//				this.startAnimation(shake);
			}

			break;
		} // end switch
		return true;

	}

	public DamageLineView(Context context, AttributeSet attributes) {
		super(context, attributes);
		//getHolder().addCallback(this);
		// lineThread = new DamageViewThread(getHolder(), this);
		setFocusable(true);
		if (isInEditMode()) {
			damageLine = new ModelDamageLine(8,3);
		} else {
			damageLine = new ModelDamageLine(5,3);
		}
		
		textureFond = context.getResources().getDrawable(R.drawable.texture_beige);
		paint = new Paint();
	}

	public DamageLineView(Context context) {
		this(context, null);
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
	}

	@Override
	public void onDraw(Canvas canvas) {

		int w = getWidth();
		int h = getHeight();

		
		paint.setStyle(Paint.Style.FILL);

		int padding = 3;

		int usableWidth = w - (padding * 2);
		
		paint.setAntiAlias(true);

		// make the entire canvas with background
		Rect clipbounds = new Rect(0, 0, w, h);
		textureFond.setBounds(clipbounds);
		
		if (!isInEditMode()) {
			textureFond.draw(canvas);
		}

		
		coords.clear();
		
		int yAxis = (int) ( h /2 ) ;

		int hitPoints = damageLine.getBoxes().size(); 
		// by default, ensure relatively constant layout even with low hit points
//		if ( damageLine.getBoxes().size() > 18) {
//			hitPoints = damageLine.getBoxes().size();	
//		}
		
		
		int halfgridDimension = ((usableWidth / hitPoints) - 3) / 2;
		halfgridDimension = Math.min( h/3, halfgridDimension); // ensure no box will be to high for the container...
		int colNum = 0;
		int columnOffset = usableWidth - ( hitPoints * ( halfgridDimension * 2 + 3));
		int usableWidthRemaining = usableWidth - columnOffset;
		// int columnOffset = hitPoints - damageLine.getBoxes().size(); // offset boxes to the right if less boxes that expected hitpoints
		for (DamageBox box : damageLine.getBoxes()) {

			int xAxis = (int)  columnOffset + (usableWidthRemaining / hitPoints * colNum) + (usableWidthRemaining / hitPoints / 2)
					+ padding;
//			int xAxis = (int) (usableWidth / hitPoints * colNum ) + (usableWidth / hitPoints / 2)
//					+ padding;

			paint.setColor(Color.BLACK); // black border
			canvas.drawRect(xAxis - halfgridDimension, yAxis
					- halfgridDimension, xAxis + halfgridDimension, yAxis
					+ halfgridDimension, paint); // (centerX, centerY, (int)
													// 10 ,paint);
			
			if (box.isCurrentlyChangePending()) {
				if (box.isDamaged() && box.isDamagedPending()) {
					paint.setColor(Color.GRAY); // damaged : gray inside
				} else if (box.isDamaged() && ! box.isDamagedPending()){
					paint.setColor(Color.GREEN);
				} else if (! box.isDamaged() && box.isDamagedPending()) {
					paint.setColor(Color.RED);
				} else {
					paint.setColor(Color.WHITE); // no damaged : white inside
				}
			} else {
				if (box.isDamaged()) {
					paint.setColor(Color.GRAY); // damaged : gray inside
				} else {
					paint.setColor(Color.WHITE); // no damaged : white inside
				}
			}	
			
			canvas.drawRect(xAxis - halfgridDimension + 1, yAxis
					- halfgridDimension + 1, xAxis + halfgridDimension - 1,
					yAxis + halfgridDimension - 1, paint);
//
//			
			if ( (hitPoints - colNum) % 5 == 0 && colNum != 0) {
				paint.setColor(Color.BLACK); 
				canvas.drawLine(xAxis - halfgridDimension, yAxis
					- halfgridDimension, xAxis + halfgridDimension, yAxis
					+ halfgridDimension, paint);
			}

			coords.add(new Coords(box, xAxis, yAxis));
			
			colNum ++;
		}

	}

	public boolean isEdit() {
		return edit;
	}

	public void setEdit(boolean edit) {
		this.edit = edit;
	}

	public ModelDamageLine getDamageLine() {
		return damageLine;
	}

	public void setDamageLine(ModelDamageLine damageLine) {
		this.damageLine = damageLine;
		damageLine.registerObserver(this);
	}

//	@Override
//	protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
//		// TODO Auto-generated method stub
//		super.onMeasure(widthMeasureSpec, heightMeasureSpec);
//		int parentWidth = MeasureSpec.getSize(widthMeasureSpec);
//		// int parentHeight = MeasureSpec.getSize(heightMeasureSpec);
//		this.setMeasuredDimension(parentWidth, parentWidth); // make sure the view is square, based upon width
//	}

	@Override
	public void onChangeDamageStatus(DamageGrid grid) {
		// statusChanged = true;
		invalidate();
	}

	@Override
	protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
		Log.d("DamageLineView", "onMeasure : w =" + widthMeasureSpec + " h = " + heightMeasureSpec);
		
		int desiredWidth = 1000;
		int desiredHeight = 48;

		int widthMode = MeasureSpec.getMode(widthMeasureSpec);
		int widthSize = MeasureSpec.getSize(widthMeasureSpec);
		int heightMode = MeasureSpec.getMode(heightMeasureSpec);
		int heightSize = MeasureSpec.getSize(heightMeasureSpec);

		int width;
		int height;

		// Measure Width
		Log.d("DamageLineView", "widthMode = "); 
		if (widthMode == MeasureSpec.EXACTLY) {
			// Must be this size
			Log.d("DamageLineView", "EXACTLY" + widthSize);
			width = widthSize;
		} else if (widthMode == MeasureSpec.AT_MOST) {
			// Can't be bigger than...
			width = Math.min(desiredWidth, widthSize);
			Log.d("DamageLineView", "AT_MOST" + width);
		} else {
			Log.d("DamageLineView", "I WHICH");
			// Be whatever you want
			width = desiredWidth;
		}

		// Measure Height
		Log.d("DamageLineView", "heightMode = "); 
		if (heightMode == MeasureSpec.EXACTLY) {
			Log.d("DamageLineView", "EXACTLY" + heightSize);
			// Must be this size
			height = heightSize;
		} else if (heightMode == MeasureSpec.AT_MOST) {
			// Can't be bigger than...
			height = Math.min(desiredHeight, heightSize);
			Log.d("DamageLineView", "AT_MOST" + height);
		} else {
			Log.d("DamageLineView", "I WHICH " + desiredHeight);
			// Be whatever you want
			height = width / 8 ;
		}

		// MUST CALL THIS
		setMeasuredDimension(width, height);

		// TODO Auto-generated method stub
//		super.onMeasure(widthMeasureSpec, heightMeasureSpec);
//		int parentWidth = MeasureSpec.getSize(widthMeasureSpec);
//		int parentHeight = MeasureSpec.getSize(heightMeasureSpec);
//		this.setMeasuredDimension(parentWidth, parentHeight); 
	}
	
	
}
